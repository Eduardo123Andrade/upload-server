import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const uploadImagesRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        body: z.object({
          name: z.string(),
          // Define your body schema here
        }),
        response: {
          201: z.object({ uploadId: z.string() }),
          409: z
            .object({ message: z.string() })
            .describe('Image already exists'),
        },
      },
    },
    async (request, reply) => {
      return reply.status(201).send({ uploadId: 'some-upload-id' })
    }
  )
}
