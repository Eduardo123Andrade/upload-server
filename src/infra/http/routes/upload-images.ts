import { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const uploadImagesRoute: FastifyPluginAsync = async (
  server: FastifyInstance
) => {
  server.post('/upload', async (request, reply) => {
    return 'Hello World'
  })
}
