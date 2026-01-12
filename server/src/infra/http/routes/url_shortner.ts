import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const urlShortnerRoute: FastifyPluginAsyncZod = async server => {
  server.post('/url-shortner', () => {
    return 'Hello World'
  })
}
