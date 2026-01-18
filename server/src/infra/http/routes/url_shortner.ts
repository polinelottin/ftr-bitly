import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/infra/db'
import { links } from '@/infra/db/schemas/links'
import { eq, sql, desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Função para gerar shortUrl única
async function generateUniqueShortUrl(length = 8): Promise<string> {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let shortUrl = ''
  let exists = true

  while (exists) {
    // Gerar string aleatória usando caracteres alfanuméricos
    shortUrl = Array.from({ length }, () => {
      return characters[Math.floor(Math.random() * characters.length)]
    }).join('')

    const existingLink = await db
      .select()
      .from(links)
      .where(eq(links.shortUrl, shortUrl))
      .limit(1)

    exists = existingLink.length > 0
  }

  return shortUrl
}

// Função para gerar filename único para CSV
function generateUniqueFilename(): string {
  const timestamp = Date.now()
  const random = randomBytes(4).toString('hex')
  return `links-export-${timestamp}-${random}.csv`
}

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

    try {
      // Gerar shortUrl única
      const shortUrl = await generateUniqueShortUrl()

      // Inserir no banco de dados
      const [newLink] = await db
        .insert(links)
        .values({
          originalUrl: url,
          shortUrl,
        })
        .returning()

      return reply.status(201).send({
        id: newLink.id,
        originalUrl: newLink.originalUrl,
        shortUrl: newLink.shortUrl,
        createdAt: newLink.createdAt,
      })
    } catch (error: any) {
      // Verificar se é erro de duplicação de shortUrl (não deve acontecer, mas tratamento de segurança)
      if (error.code === '23505' || error.constraint === 'links_short_url_unique') {
        // Se por algum motivo ainda houver duplicação, tentar novamente
        const shortUrl = await generateUniqueShortUrl()
        const [newLink] = await db
          .insert(links)
          .values({
            originalUrl: url,
            shortUrl,
          })
          .returning()

        return reply.status(201).send({
          id: newLink.id,
          originalUrl: newLink.originalUrl,
          shortUrl: newLink.shortUrl,
          createdAt: newLink.createdAt,
        })
      }

      throw error
    }
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

    // Verificar se o link existe
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.id, id))
      .limit(1)

    if (!link) {
      return reply.status(404).send({
        message: 'Link not found',
      })
    }

    // Deletar do banco de dados
    await db
      .delete(links)
      .where(eq(links.id, id))

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

    // Decodificar URL-encoded shortUrl
    const decodedShortUrl = decodeURIComponent(shortUrl)

    // Buscar link pela URL encurtada
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.shortUrl, decodedShortUrl))
      .limit(1)

    if (!link) {
      return reply.status(404).send({
        message: 'Link not found',
      })
    }

    return reply.status(200).send({
      id: link.id,
      originalUrl: link.originalUrl,
      shortUrl: link.shortUrl,
      accessCount: link.accessCount,
      createdAt: link.createdAt,
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

    // Calcular offset
    const offset = (page - 1) * limit

    // Buscar links com paginação
    const linksList = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .offset(offset)

    // Contar total de links
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(links)

    return reply.status(200).send({
      links: linksList.map(link => ({
        id: link.id,
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        accessCount: link.accessCount,
        createdAt: link.createdAt,
      })),
      total: count,
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

    // Verificar se o link existe
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.id, id))
      .limit(1)

    if (!link) {
      return reply.status(404).send({
        message: 'Link not found',
      })
    }

    // Incrementar contador de acessos
    const [updatedLink] = await db
      .update(links)
      .set({
        accessCount: sql`${links.accessCount} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(links.id, id))
      .returning()

    return reply.status(200).send({
      id: updatedLink.id,
      originalUrl: updatedLink.originalUrl,
      shortUrl: updatedLink.shortUrl,
      accessCount: updatedLink.accessCount,
      updatedAt: updatedLink.updatedAt,
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
    // Buscar todos os links do banco
    const allLinks = await db
      .select()
      .from(links)
      .orderBy(desc(links.createdAt))

    // Gerar CSV
    const csvHeader = 'originalUrl,shortUrl,accessCount,createdAt\n'
    const csvRows = allLinks.map(link => {
      const originalUrl = `"${link.originalUrl.replace(/"/g, '""')}"`
      const shortUrl = `"${link.shortUrl}"`
      const accessCount = link.accessCount
      const createdAt = new Date(link.createdAt).toISOString()
      return `${originalUrl},${shortUrl},${accessCount},${createdAt}`
    }).join('\n')

    const csvContent = csvHeader + csvRows

    // Gerar filename único
    const filename = generateUniqueFilename()

    // Simular upload para CDN (em produção, aqui seria feito upload real para S3/R2/etc)
    // Para testes e desenvolvimento, usamos uma URL mock que funciona
    const baseUrl = process.env.CDN_BASE_URL || 'https://cdn.example.com/exports'
    const cdnUrl = `${baseUrl}/${filename}`

    // Em produção real, aqui você faria:
    // await uploadToCDN(csvContent, filename)

    return reply.status(200).send({
      url: cdnUrl,
      filename,
    })
  })
}
