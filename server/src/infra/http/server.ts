import { env } from '@/env'
import { urlShortnerRoute } from '@/infra/http/routes/url_shortner'
import { getLinkByShortUrl } from '@/app/functions/get-link-by-short-url'
import { incrementAccessCount } from '@/app/functions/increment-access-count'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation || [],
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})

server.register(fastifyCors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brev.ly Server',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(urlShortnerRoute)

// Rota de redirecionamento - deve ser registrada por último para não conflitar com outras rotas
server.get('/*', async (request, reply) => {
  const path = request.url.split('?')[0] // Remove query params
  
  // Ignorar rotas conhecidas da API
  if (
    path.startsWith('/docs') ||
    path.startsWith('/url-shortner') ||
    path.startsWith('/favicon.ico') ||
    path === '/'
  ) {
    return reply.status(404).send({
      message: `Route ${request.method}:${path} not found`,
      error: 'Not Found',
      statusCode: 404,
    })
  }

  // Extrair o shortUrl da URL (remove a barra inicial)
  const shortUrl = path.slice(1)

  try {
    // Buscar o link
    const linkResult = await getLinkByShortUrl(shortUrl)

    if (isRight(linkResult)) {
      const link = unwrapEither(linkResult)
      
      // Incrementar contador de acessos (não aguardar para não atrasar o redirecionamento)
      incrementAccessCount(shortUrl).catch((error) => {
        console.error('Erro ao incrementar contador de acessos:', error)
      })

      // Redirecionar para a URL original
      return reply.redirect(link.originalUrl)
    }

    // Link não encontrado
    return reply.status(404).send({
      message: `Route ${request.method}:${path} not found`,
      error: 'Not Found',
      statusCode: 404,
    })
  } catch (error) {
    console.error('Erro ao redirecionar:', error)
    return reply.status(500).send({ message: 'Internal server error.' })
  }
})

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server running!')
})
