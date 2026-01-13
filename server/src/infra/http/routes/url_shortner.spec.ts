import { urlShortnerRoute } from './url_shortner'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

async function createTestServer() {
  const server = fastify()

  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: 'Validation error',
        issues: error.validation,
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
  })

  describe('DELETE /url-shortner/:id', () => {
    test('should be able to delete a link', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${validUuid}`,
      })

      expect(response.statusCode).toBe(204)
    })

    test('should not delete a link with invalid UUID format', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/url-shortner/invalid-id',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should handle different UUID formats', async () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ]

      for (const uuid of validUuids) {
        const response = await server.inject({
          method: 'DELETE',
          url: `/url-shortner/${uuid}`,
        })

        expect(response.statusCode).toBe(204)
      }
    })

    test('should validate DELETE response has no body', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'

      const response = await server.inject({
        method: 'DELETE',
        url: `/url-shortner/${validUuid}`,
      })

      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })
  })

  describe('GET /url-shortner/:shortUrl', () => {
    test('should be able to get a link by short URL', async () => {
      const shortUrl = 'abc123'

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
      const shortUrls = ['abc', '123', 'abc-123', 'test_url']

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
      const shortUrl = 'test%20url'
      const decodedShortUrl = 'test url'

      const response = await server.inject({
        method: 'GET',
        url: `/url-shortner/${shortUrl}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.shortUrl).toBe(decodedShortUrl)
    })

    test('should validate response structure for get by short URL', async () => {
      const shortUrl = 'test123'

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
  })

  describe('PATCH /url-shortner/:id/access', () => {
    test('should be able to increment access count', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${validUuid}/access`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('originalUrl')
      expect(body).toHaveProperty('shortUrl')
      expect(body).toHaveProperty('accessCount')
      expect(body).toHaveProperty('updatedAt')
      expect(body.id).toBe(validUuid)
      expect(typeof body.accessCount).toBe('number')
    })

    test('should not increment access with invalid UUID format', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: '/url-shortner/invalid-id/access',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('message')
    })

    test('should handle different UUID formats', async () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
      ]

      for (const uuid of validUuids) {
        const response = await server.inject({
          method: 'PATCH',
          url: `/url-shortner/${uuid}/access`,
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.id).toBe(uuid)
      }
    })

    test('should validate response structure for access increment', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'

      const response = await server.inject({
        method: 'PATCH',
        url: `/url-shortner/${validUuid}/access`,
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
  })

  describe('GET /url-shortner/export', () => {
    test('should be able to export links as CSV', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('url')
      expect(body).toHaveProperty('filename')
      expect(typeof body.url).toBe('string')
      expect(typeof body.filename).toBe('string')
      expect(body.url).toMatch(/^https?:\/\//)
    })

    test('should return valid URL format for export', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.url).toBeTruthy()
      expect(body.filename).toBeTruthy()
    })

    test('should validate export response structure', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/url-shortner/export',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(typeof body.url).toBe('string')
      expect(typeof body.filename).toBe('string')
      expect(body.url.length).toBeGreaterThan(0)
      expect(body.filename.length).toBeGreaterThan(0)
      expect(body.url).toMatch(/^https?:\/\//)
    })
  })
})
