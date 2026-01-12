import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const urlShortnerRoute: FastifyPluginAsyncZod = async server => {
  // Criar um link
  server.post('/url-shortner', {
    schema: {
      body: z.object({
        url: z.url(),
      }),
      response: {
        201: z.object({
          id: z.string(),
          originalUrl: z.string().url(),
          shortUrl: z.string(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request, reply) => {
    const { url } = request.body

    // TODO: Implementar lógica de criação
    // - Validar formato da URL
    // - Gerar URL encurtada única
    // - Verificar se a URL encurtada já existe
    // - Salvar no banco de dados

    console.log(url)

    return reply.status(201).send({
      id: 'placeholder-id',
      originalUrl: url,
      shortUrl: 'placeholder-short',
      createdAt: new Date(),
    })
  })

  // Deletar um link
  server.delete('/url-shortner/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.void(),
        404: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { id } = request.params

    // TODO: Implementar lógica de deleção
    // - Buscar link pelo ID
    // - Deletar do banco de dados

    return reply.status(204).send()
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
      },
    },
  }, async (request, reply) => {
    const { shortUrl } = request.params

    // TODO: Implementar lógica de busca
    // - Buscar link pela URL encurtada
    // - Retornar URL original

    return reply.status(200).send({
      id: 'placeholder-id',
      originalUrl: 'https://example.com',
      shortUrl,
      accessCount: 0,
      createdAt: new Date(),
    })
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
      },
    },
  }, async (request, reply) => {
    const { page = 1, limit = 10 } = request.query

    // TODO: Implementar lógica de listagem
    // - Buscar links do banco de dados com paginação
    // - Retornar lista de links

    return reply.status(200).send({
      links: [],
      total: 0,
      page,
      limit,
    })
  })

  // Incrementar a quantidade de acessos de um link
  server.patch('/url-shortner/:id/access', {
    schema: {
      params: z.object({
        id: z.string().uuid(),
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
      },
    },
  }, async (request, reply) => {
    const { id } = request.params

    // TODO: Implementar lógica de incremento
    // - Buscar link pelo ID
    // - Incrementar contador de acessos
    // - Atualizar no banco de dados

    return reply.status(200).send({
      id,
      originalUrl: 'https://example.com',
      shortUrl: 'placeholder-short',
      accessCount: 1,
      updatedAt: new Date(),
    })
  })

  // Exportar os links criados em um CSV
  server.get('/url-shortner/export', {
    schema: {
      response: {
        200: z.object({
          url: z.string().url(),
          filename: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    // TODO: Implementar lógica de exportação
    // - Buscar todos os links do banco
    // - Gerar CSV com campos: URL original, URL encurtada, contagem de acessos, data de criação
    // - Upload para CDN (S3, Cloudflare R2, etc)
    // - Gerar nome aleatório e único para o arquivo
    // - Retornar URL do arquivo

    return reply.status(200).send({
      url: 'https://cdn.example.com/exports/placeholder.csv',
      filename: 'placeholder.csv',
    })
  })
}
