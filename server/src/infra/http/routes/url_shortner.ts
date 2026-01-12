import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'


export const urlShortnerRoute: FastifyPluginAsyncZod = async server => {
  server.post('/url-shortner', {
    schema: {
      body: z.object({
        url: z.url(),
      }),
    },
  }, async (request, reply) => {
    const { url } = request.body as { url: string }

    console.log(url)

    return reply.status(201).send({
      url,
    })
  })
}
