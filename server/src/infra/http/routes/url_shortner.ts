import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createLink } from '@/app/functions/create-link'
import { deleteLink } from '@/app/functions/delete-link'
import { getLinkByShortUrl } from '@/app/functions/get-link-by-short-url'
import { incrementAccessCount } from '@/app/functions/increment-access-count'
import { listLinks } from '@/app/functions/list-links'
import { exportLinks } from '@/app/functions/export-links'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { LinkNotFound } from '@/app/functions/errors/link-not-found'
import { DuplicateShortUrlError } from '@/app/functions/errors/duplicate-short-url'

export const urlShortnerRoute: FastifyPluginAsyncZod = async server => {
  // Criar um link
  server.post('/url-shortner', {
    schema: {
      body: z.object({
        url: z.url(),
        shortUrl: z
          .string()
          .regex(/^[a-zA-Z0-9_-]+$/, 'Short URL must contain only alphanumeric characters, hyphens, and underscores')
          .min(1, 'Short URL must be at least 1 character long')
          .max(255, 'Short URL must be at most 255 characters long')
          .optional(),
      }),
      response: {
        201: z.object({
          id: z.string(),
          originalUrl: z.string().url(),
          shortUrl: z.string(),
          createdAt: z.date(),
        }),
        400: z.object({
          message: z.string(),
          issues: z.array(z.any()),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { url, shortUrl } = request.body

      const result = await createLink(url, shortUrl)

      if (isRight(result)) {
        const link = unwrapEither(result)
        return reply.status(201).send({
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: link.shortUrl,
          createdAt: link.createdAt,
        })
      }

      const error = unwrapEither(result)

      if (error instanceof DuplicateShortUrlError) {
        return reply.status(400).send({ message: error.message, issues: [] })
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error: any) {
      console.error('Error creating link:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        constraint: error?.constraint,
        stack: error?.stack,
      })
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })

  // Deletar um link
  server.delete('/url-shortner/:shortUrl', {
    schema: {
      params: z.object({
        shortUrl: z.string(),
      }),
      response: {
        204: z.void(),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { shortUrl } = request.params

      const result = await deleteLink(shortUrl)

      if (isRight(result)) {
        unwrapEither(result) // Consumir o resultado mas não usar
        return reply.status(204).send()
      }

      const error = unwrapEither(result)

      if (error instanceof LinkNotFound) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error) {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })

  // Obter a URL original por meio de uma URL encurtada
  server.get('/url-shortner/:shortUrl', {
    schema: {
      params: z.object({
        shortUrl: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          originalUrl: z.string().url(),
          shortUrl: z.string(),
          accessCount: z.number(),
          createdAt: z.date(),
        }),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { shortUrl } = request.params

      const result = await getLinkByShortUrl(shortUrl)

      if (isRight(result)) {
        const link = unwrapEither(result)
        return reply.status(200).send({
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: link.shortUrl,
          accessCount: link.accessCount,
          createdAt: link.createdAt,
        })
      }

      const error = unwrapEither(result)

      if (error instanceof LinkNotFound) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error) {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })

  // Listar todas as URL's cadastradas
  server.get('/url-shortner', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().int().positive().default(1).optional(),
        limit: z.coerce.number().int().positive().max(100).default(10).optional(),
      }),
      response: {
        200: z.object({
          links: z.array(z.object({
            id: z.string(),
            originalUrl: z.string().url(),
            shortUrl: z.string(),
            accessCount: z.number(),
            createdAt: z.date(),
          })),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 10 } = request.query

      const result = await listLinks(page, limit)

      if (isRight(result)) {
        const data = unwrapEither(result)
        return reply.status(200).send(data)
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error) {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })

  // Incrementar a quantidade de acessos de um link
  server.patch('/url-shortner/:shortUrl/access', {
    schema: {
      params: z.object({
        shortUrl: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          originalUrl: z.string().url(),
          shortUrl: z.string(),
          accessCount: z.number(),
          updatedAt: z.date(),
        }),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const { shortUrl } = request.params

      const result = await incrementAccessCount(shortUrl)

      if (isRight(result)) {
        const link = unwrapEither(result)
        return reply.status(200).send({
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: link.shortUrl,
          accessCount: link.accessCount,
          updatedAt: link.updatedAt,
        })
      }

      const error = unwrapEither(result)

      if (error instanceof LinkNotFound) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error) {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })

  // Exportar os links criados em um CSV
  server.get('/url-shortner/export', {
    schema: {
      response: {
        200: z.object({
          url: z.string().url(),
          filename: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const result = await exportLinks()

      if (isRight(result)) {
        const data = unwrapEither(result)
        return reply.status(200).send(data)
      }

      return reply.status(500).send({ message: 'Internal server error.' })
    } catch (error) {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  })
}
