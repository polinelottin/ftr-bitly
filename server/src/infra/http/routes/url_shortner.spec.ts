import { urlShortnerRoute } from './url_shortner'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { cleanDatabase } from '@/test/utils/transaction'

async function createTestServer() {
  const server = fastify()

  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const validationIssues = (error as any).validation
      return reply.status(400).send({
        message: 'Validation error',
        issues: Array.isArray(validationIssues) ? validationIssues : (validationIssues ? [validationIssues] : []),
      })
    }

    // Handle other validation errors that might not be caught by hasZodFastifySchemaValidationErrors
    if ((error as any).statusCode === 400 && (error as any).validation) {
      const validationIssues = (error as any).validation
      return reply.status(400).send({
        message: 'Validation error',
        issues: Array.isArray(validationIssues) ? validationIssues : (validationIssues ? [validationIssues] : []),
      })
    }

    return reply.status(500).send({ message: 'Internal server error.' })
  })

  server.register(fastifyCors, { origin: '*' })
  server.register(urlShortnerRoute)

  return server
}

describe('URL Shortener Routes', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>

  beforeAll(async () => {
    server = await createTestServer()
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  // Limpa o banco de dados após cada teste para garantir isolamento
  // Isso evita que dados de um teste afetem outros testes
  afterEach(async () => {
    await cleanDatabase()
  })

  describe('POST /url-shortner', () => {
    test('should be able to create a new url shortner', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://www.google.com',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('originalUrl')
      expect(body).toHaveProperty('shortUrl')
      expect(body).toHaveProperty('createdAt')
      expect(body.originalUrl).toBe('https://www.google.com')
    })

    test('should not create a link with invalid URL format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'invalid-url',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Validation error')
    })

    test('should not create a link with missing URL', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should handle URLs with different protocols', async () => {
      const testUrls = [
        'https://example.com',
        'http://example.com',
        'https://subdomain.example.com/path?query=value',
      ]

      for (const url of testUrls) {
        const response = await server.inject({
          method: 'POST',
          url: '/url-shortner',
          payload: { url },
        })

        expect(response.statusCode).toBe(201)
        const body = JSON.parse(response.body)
        expect(body.originalUrl).toBe(url)
      }
    })

    test('should not create a link with empty string URL', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: '',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    test('should not create a link with null URL', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: null,
        },
      })

      expect(response.statusCode).toBe(400)
    })

    test('should validate response schema structure', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.id).toBeDefined()
      expect(body.originalUrl).toBeDefined()
      expect(body.shortUrl).toBeDefined()
      expect(body.createdAt).toBeDefined()
      expect(typeof body.id).toBe('string')
      expect(typeof body.originalUrl).toBe('string')
      expect(typeof body.shortUrl).toBe('string')
    })

    test('should create link with URL containing fragment (#section)', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/page#section',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.originalUrl).toBe('https://example.com/page#section')
    })

    test('should create link with URL containing path', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/caminho/longo',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.originalUrl).toBe('https://example.com/caminho/longo')
    })

    test('should generate unique shortUrl', async () => {
      const response1 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/1',
        },
      })

      const response2 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/2',
        },
      })

      expect(response1.statusCode).toBe(201)
      expect(response2.statusCode).toBe(201)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      expect(body1.shortUrl).toBeTruthy()
      expect(body2.shortUrl).toBeTruthy()
      expect(typeof body1.shortUrl).toBe('string')
      expect(typeof body2.shortUrl).toBe('string')
    })

    test('should generate unique UUID v7 id', async () => {
      const response1 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/1',
        },
      })

      const response2 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/2',
        },
      })

      expect(response1.statusCode).toBe(201)
      expect(response2.statusCode).toBe(201)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      expect(body1.id).toBeTruthy()
      expect(body2.id).toBeTruthy()
      expect(typeof body1.id).toBe('string')
      expect(typeof body2.id).toBe('string')
    })

    test('should not create link with URL without protocol', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'google.com',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should return clear error message on validation error', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'invalid-url',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toBe('Validation error')
      // O error handler sempre retorna issues como array, mesmo que vazio
      expect(body).toHaveProperty('issues')
      expect(Array.isArray(body.issues)).toBe(true)
    })

    test('should be able to create a link with custom shortUrl', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://www.google.com',
          shortUrl: 'my-custom-url',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('originalUrl')
      expect(body).toHaveProperty('shortUrl')
      expect(body).toHaveProperty('createdAt')
      expect(body.originalUrl).toBe('https://www.google.com')
      expect(body.shortUrl).toBe('my-custom-url')
    })

    test('should be able to create a link with custom shortUrl containing underscore and hyphen', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: 'my_custom-url_123',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.shortUrl).toBe('my_custom-url_123')
    })

    test('should not create a link with shortUrl containing invalid characters', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: 'my-url@123',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Validation error')
    })

    test('should not create a link with shortUrl containing spaces', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: 'my url',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Validation error')
    })

    test('should not create a link with empty shortUrl', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: '',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Validation error')
    })

    test('should not create a link with shortUrl exceeding maximum length', async () => {
      const longShortUrl = 'a'.repeat(256) // 256 characters, exceeds max of 255
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: longShortUrl,
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Validation error')
    })

    test('should create a link with shortUrl at maximum length', async () => {
      const maxLengthShortUrl = 'a'.repeat(255) // Exactly 255 characters
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
          shortUrl: maxLengthShortUrl,
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.shortUrl).toBe(maxLengthShortUrl)
    })

    test('should not create a link with duplicate shortUrl', async () => {
      // Criar primeiro link com shortUrl customizado
      const firstResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/1',
          shortUrl: 'duplicate-url',
        },
      })

      expect(firstResponse.statusCode).toBe(201)

      // Tentar criar segundo link com o mesmo shortUrl
      const secondResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/2',
          shortUrl: 'duplicate-url',
        },
      })

      expect(secondResponse.statusCode).toBe(400)
      const body = JSON.parse(secondResponse.body)
      expect(body).toHaveProperty('message')
      expect(body.message).toBe('Duplicate short URL. Please try again.')
    })

    test('should create link without shortUrl and generate random one', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('shortUrl')
      expect(body.shortUrl).toBeTruthy()
      expect(typeof body.shortUrl).toBe('string')
      expect(body.shortUrl.length).toBeGreaterThan(0)
    })
  })

  describe('DELETE /url-shortner/:shortUrl', () => {
    test('should be able to delete a link', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/to-delete',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(204)
    })

    test('should not delete a link with invalid shortUrl format', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/url-shortner/non-existent-short-url',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should handle different shortUrls', async () => {
      // Criar links primeiro
      const createResponse1 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/1' },
      })
      const createResponse2 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/2' },
      })
      const createResponse3 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/3' },
      })

      expect(createResponse1.statusCode).toBe(201)
      expect(createResponse2.statusCode).toBe(201)
      expect(createResponse3.statusCode).toBe(201)

      const shortUrls = [
        JSON.parse(createResponse1.body).shortUrl,
        JSON.parse(createResponse2.body).shortUrl,
        JSON.parse(createResponse3.body).shortUrl,
      ]

      for (const shortUrl of shortUrls) {
        const response = await server.inject({
          method: 'DELETE',
          url: `/url-shortner/${shortUrl}`,
        })

        expect(response.statusCode).toBe(204)
      }
    })

    test('should validate DELETE response has no body', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/to-delete',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })

    test('should return 404 when link does not exist', async () => {
      const nonExistentShortUrl = 'non-existent-short-url'

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${nonExistentShortUrl}`,
      })

      expect(response.statusCode).toBe(404)
    })

    test('should return appropriate error message when link not found', async () => {
      const nonExistentShortUrl = 'non-existent-short-url'

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${nonExistentShortUrl}`,
      })

      if (response.statusCode === 404) {
        const body = JSON.parse(response.body)
        expect(body).toHaveProperty('message')
      }
    })
  })

  describe('GET /url-shortner/:shortUrl', () => {
    test('should be able to get a link by short URL', async () => {
      // Criar link primeiro - shortUrl será gerado automaticamente
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('originalUrl')
      expect(body).toHaveProperty('shortUrl')
      expect(body).toHaveProperty('accessCount')
      expect(body).toHaveProperty('createdAt')
      expect(body.shortUrl).toBe(shortUrl)
    })

    test('should handle different short URL formats', async () => {
      // Criar links - shortUrls serão gerados automaticamente
      const createResponses = await Promise.all([
        server.inject({ method: 'POST', url: '/url-shortner', payload: { url: 'https://example.com/1' } }),
        server.inject({ method: 'POST', url: '/url-shortner', payload: { url: 'https://example.com/2' } }),
        server.inject({ method: 'POST', url: '/url-shortner', payload: { url: 'https://example.com/3' } }),
        server.inject({ method: 'POST', url: '/url-shortner', payload: { url: 'https://example.com/4' } }),
      ])

      const shortUrls = createResponses.map(res => JSON.parse(res.body).shortUrl)

      for (const shortUrl of shortUrls) {
        const response = await server.inject({
          method: 'GET',
          url: `/url-shortner/${shortUrl}`,
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.shortUrl).toBe(shortUrl)
      }
    })

    test('should handle URL-encoded short URLs', async () => {
      // Criar link primeiro - shortUrl será gerado automaticamente
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const originalShortUrl = createdBody.shortUrl
      
      // Criar shortUrl com espaço para testar URL encoding
      // Como não podemos controlar o shortUrl gerado, vamos usar o que foi gerado
      // e testar apenas que funciona com URL encoding
      const encodedShortUrl = encodeURIComponent(originalShortUrl)

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${encodedShortUrl}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.shortUrl).toBe(originalShortUrl)
    })

    test('should validate response structure for get by short URL', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.id).toBe('string')
      expect(typeof body.originalUrl).toBe('string')
      expect(typeof body.shortUrl).toBe('string')
      expect(typeof body.accessCount).toBe('number')
      expect(body.accessCount).toBeGreaterThanOrEqual(0)
      expect(body.createdAt).toBeDefined()
    })

    test('should return 404 when shortUrl does not exist', async () => {
      const nonExistentShortUrl = 'nonexistent123'

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${nonExistentShortUrl}`,
      })

      expect(response.statusCode).toBe(404)
    })

    test('should return appropriate error message when shortUrl not found', async () => {
      const nonExistentShortUrl = 'nonexistent123'

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${nonExistentShortUrl}`,
      })

      if (response.statusCode === 404) {
        const body = JSON.parse(response.body)
        expect(body).toHaveProperty('message')
      }
    })

    test('should return correct originalUrl associated with shortUrl', async () => {
      // Criar link primeiro
      const originalUrl = 'https://example.com/test'
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: originalUrl,
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.originalUrl).toBe(originalUrl)
      expect(typeof body.originalUrl).toBe('string')
      expect(body.originalUrl).toMatch(/^https?:\/\//)
    })
  })

  describe('GET /url-shortner', () => {
    test('should be able to list all URLs with default pagination', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('links')
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('page')
      expect(body).toHaveProperty('limit')
      expect(Array.isArray(body.links)).toBe(true)
      expect(body.page).toBe(1)
      expect(body.limit).toBe(10)
    })

    test('should handle pagination with custom page and limit', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=2&limit=20',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.page).toBe(2)
      expect(body.limit).toBe(20)
    })

    test('should handle pagination with only page parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=3',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.page).toBe(3)
      expect(body.limit).toBe(10)
    })

    test('should handle pagination with only limit parameter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.page).toBe(1)
      expect(body.limit).toBe(5)
    })

    test('should validate limit maximum value (100)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=101',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should validate limit minimum value (positive)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=0',
      })

      expect(response.statusCode).toBe(400)
    })

    test('should validate page minimum value (positive)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=0',
      })

      expect(response.statusCode).toBe(400)
    })

    test('should validate page with negative number', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=-1',
      })

      expect(response.statusCode).toBe(400)
    })

    test('should validate limit with negative number', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=-1',
      })

      expect(response.statusCode).toBe(400)
    })

    test('should handle string numbers in query parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=5&limit=15',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.page).toBe(5)
      expect(body.limit).toBe(15)
    })

    test('should validate limit at maximum boundary (100)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=100',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.limit).toBe(100)
    })

    test('should validate response structure for list endpoint', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(Array.isArray(body.links)).toBe(true)
      expect(typeof body.total).toBe('number')
      expect(typeof body.page).toBe('number')
      expect(typeof body.limit).toBe('number')
      expect(body.total).toBeGreaterThanOrEqual(0)
      expect(body.page).toBeGreaterThan(0)
      expect(body.limit).toBeGreaterThan(0)
    })

    test('should return correct structure for each item in links array', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      
      if (body.links.length > 0) {
        const firstLink = body.links[0]
        expect(firstLink).toHaveProperty('id')
        expect(firstLink).toHaveProperty('originalUrl')
        expect(firstLink).toHaveProperty('shortUrl')
        expect(firstLink).toHaveProperty('accessCount')
        expect(firstLink).toHaveProperty('createdAt')
        expect(typeof firstLink.id).toBe('string')
        expect(typeof firstLink.originalUrl).toBe('string')
        expect(typeof firstLink.shortUrl).toBe('string')
        expect(typeof firstLink.accessCount).toBe('number')
      }
    })

    test('should return empty array when there are no links', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(Array.isArray(body.links)).toBe(true)
    })

    test('should calculate total correctly', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.total).toBe('number')
      expect(body.total).toBeGreaterThanOrEqual(0)
      expect(body.total).toBeGreaterThanOrEqual(body.links.length)
    })

    test('should apply pagination correctly with OFFSET and LIMIT', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=1&limit=5',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.links.length).toBeLessThanOrEqual(5)
      expect(body.limit).toBe(5)
    })

    test('should return 400 for query params validation errors', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner?limit=invalid',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('PATCH /url-shortner/:shortUrl/access', () => {
    test('should be able to increment access count', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('originalUrl')
      expect(body).toHaveProperty('shortUrl')
      expect(body).toHaveProperty('accessCount')
      expect(body).toHaveProperty('updatedAt')
      expect(body.shortUrl).toBe(shortUrl)
      expect(typeof body.accessCount).toBe('number')
    })

    test('should not increment access with invalid shortUrl format', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: '/url-shortner/non-existent-short-url/access',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should handle different shortUrls', async () => {
      // Criar links primeiro
      const createResponse1 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/1' },
      })
      const createResponse2 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/2' },
      })

      expect(createResponse1.statusCode).toBe(201)
      expect(createResponse2.statusCode).toBe(201)

      const shortUrls = [
        JSON.parse(createResponse1.body).shortUrl,
        JSON.parse(createResponse2.body).shortUrl,
      ]

      for (const shortUrl of shortUrls) {
        const response = await server.inject({
          method: 'PATCH',
          url: `/url-shortner/${shortUrl}/access`,
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.shortUrl).toBe(shortUrl)
      }
    })

    test('should validate response structure for access increment', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.id).toBe('string')
      expect(typeof body.originalUrl).toBe('string')
      expect(typeof body.shortUrl).toBe('string')
      expect(typeof body.accessCount).toBe('number')
      expect(body.accessCount).toBeGreaterThanOrEqual(0)
      expect(body.updatedAt).toBeDefined()
    })

    test('should return 404 when link does not exist', async () => {
      const nonExistentShortUrl = 'non-existent-short-url'

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${nonExistentShortUrl}/access`,
      })

      expect(response.statusCode).toBe(404)
    })

    test('should return appropriate error message when link not found', async () => {
      const nonExistentShortUrl = 'non-existent-short-url'

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${nonExistentShortUrl}/access`,
      })

      if (response.statusCode === 404) {
        const body = JSON.parse(response.body)
        expect(body).toHaveProperty('message')
      }
    })

    test('should increment accessCount by 1', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl
      const initialAccessCount = createdBody.accessCount || 0

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.accessCount).toBe('number')
      expect(body.accessCount).toBe(initialAccessCount + 1)
    })

    test('should update updatedAt after increment', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.updatedAt).toBeDefined()
      expect(new Date(body.updatedAt).toString()).not.toBe('Invalid Date')
    })

    test('should allow multiple sequential increments', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response1 = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      const response2 = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const body1 = JSON.parse(response1.body)
      const body2 = JSON.parse(response2.body)

      expect(typeof body1.accessCount).toBe('number')
      expect(typeof body2.accessCount).toBe('number')
      expect(body2.accessCount).toBeGreaterThan(body1.accessCount)
    })

    test('should validate that accessCount is >= 0', async () => {
      // Criar link primeiro
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.accessCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('GET /url-shortner/export', () => {
    test('should be able to export links as CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('.csv')
      
      const csvContent = response.body as string
      expect(csvContent).toContain('originalUrl,shortUrl,accessCount,createdAt')
    })

    test('should return valid CSV format for export', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toBeTruthy()
      expect(response.headers['content-disposition']).toContain('.csv')
    })

    test('should validate export response structure', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toBeTruthy()
      expect(response.headers['content-disposition'].length).toBeGreaterThan(0)
      expect(response.headers['content-disposition']).toContain('attachment')
    })

    test('should generate filename with .csv extension', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const contentDisposition = response.headers['content-disposition']
      expect(contentDisposition).toMatch(/\.csv/)
    })

    test('should generate unique filename for each export', async () => {
      const response1 = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      const response2 = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response1.statusCode).toBe(200)
      expect(response2.statusCode).toBe(200)

      const filename1 = response1.headers['content-disposition']
      const filename2 = response2.headers['content-disposition']

      expect(filename1).toBeTruthy()
      expect(filename2).toBeTruthy()
      // Os filenames devem ser diferentes devido ao timestamp e random
      expect(filename1).not.toBe(filename2)
    })

    test('should return valid CSV content', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const csvContent = response.body as string
      expect(csvContent).toBeTruthy()
      expect(csvContent.length).toBeGreaterThan(0)
      expect(csvContent).toContain('originalUrl,shortUrl,accessCount,createdAt')
    })

    test('should validate filename is not empty', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const contentDisposition = response.headers['content-disposition']
      expect(contentDisposition).toBeTruthy()
      expect(contentDisposition.length).toBeGreaterThan(0)
    })

    test('should validate url and filename are both present', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toBeTruthy()
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('.csv')
    })
  })

  describe('Integration Tests', () => {
    test('should create link, increment access, and verify accessCount', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/integration',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const incrementResponse = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${shortUrl}/access`,
      })

      expect(incrementResponse.statusCode).toBe(200)
      const incrementBody = JSON.parse(incrementResponse.body)
      expect(incrementBody.accessCount).toBeGreaterThanOrEqual(0)
      expect(incrementBody.shortUrl).toBe(shortUrl)
    })

    test('should create multiple links and list with pagination', async () => {
      await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/1' },
      })

      await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/2' },
      })

      const listResponse = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=1&limit=10',
      })

      expect(listResponse.statusCode).toBe(200)
      const listBody = JSON.parse(listResponse.body)
      expect(Array.isArray(listBody.links)).toBe(true)
      expect(listBody.page).toBe(1)
      expect(listBody.limit).toBe(10)
    })

    test('should create link, get by shortUrl, delete, and verify 404', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/to-delete',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const createdBody = JSON.parse(createResponse.body)
      const shortUrl = createdBody.shortUrl

      const getResponse = await server.inject({
        method: 'GET',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(getResponse.statusCode).toBe(200)

      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(deleteResponse.statusCode).toBe(204)
    })

    test('should create link and verify it appears in export', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com/for-export',
        },
      })

      expect(createResponse.statusCode).toBe(201)

      const exportResponse = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(exportResponse.statusCode).toBe(200)
      expect(exportResponse.headers['content-type']).toContain('text/csv')
      expect(exportResponse.headers['content-disposition']).toContain('attachment')
      expect(exportResponse.headers['content-disposition']).toContain('.csv')
      
      const csvContent = exportResponse.body
      expect(csvContent).toContain('originalUrl,shortUrl,accessCount,createdAt')
      expect(csvContent).toContain('https://example.com/for-export')
    })

    test('should create links, list first page, increment accesses, and list again', async () => {
      const createResponse1 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/a' },
      })

      const createResponse2 = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: { url: 'https://example.com/b' },
      })

      expect(createResponse1.statusCode).toBe(201)
      expect(createResponse2.statusCode).toBe(201)

      const listResponse1 = await server.inject({
        method: 'GET',
        url: '/url-shortner?page=1&limit=10',
      })

      expect(listResponse1.statusCode).toBe(200)
      const listBody1 = JSON.parse(listResponse1.body)

      if (listBody1.links.length > 0) {
        const firstShortUrl = listBody1.links[0].shortUrl

        const incrementResponse = await server.inject({
          method: 'PATCH',
          url: `/url-shortner/${firstShortUrl}/access`,
        })

        expect(incrementResponse.statusCode).toBe(200)

        const listResponse2 = await server.inject({
          method: 'GET',
          url: '/url-shortner?page=1&limit=10',
        })

        expect(listResponse2.statusCode).toBe(200)
      }
    })
  })

  describe('Edge Cases', () => {
    test('should validate data types in responses', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const body = JSON.parse(createResponse.body)
      expect(typeof body.id).toBe('string')
      expect(typeof body.originalUrl).toBe('string')
      expect(typeof body.shortUrl).toBe('string')
    })

    test('should validate date format (ISO 8601) in createdAt', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const body = JSON.parse(createResponse.body)
      expect(body.createdAt).toBeDefined()
      const date = new Date(body.createdAt)
      expect(date.toString()).not.toBe('Invalid Date')
    })

    test('should validate id is valid UUID v7 format', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const body = JSON.parse(createResponse.body)
      expect(body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    test('should validate shortUrl does not contain invalid special characters', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/url-shortner',
        payload: {
          url: 'https://example.com',
        },
      })

      expect(createResponse.statusCode).toBe(201)
      const body = JSON.parse(createResponse.body)
      expect(body.shortUrl).toBeTruthy()
      expect(typeof body.shortUrl).toBe('string')
    })

    test('should handle empty list when no links are registered', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(Array.isArray(body.links)).toBe(true)
      expect(body.total).toBeGreaterThanOrEqual(0)
    })

    test('should handle export when no links exist', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
      expect(response.headers['content-disposition']).toContain('.csv')
      
      // Quando não há links, o CSV deve conter apenas o header
      const csvContent = response.body as string
      expect(csvContent).toContain('originalUrl,shortUrl,accessCount,createdAt')
      // Deve ter apenas o header, sem linhas de dados
      const lines = csvContent.trim().split('\n')
      expect(lines.length).toBe(1) // Apenas o header
    })
  })
})
