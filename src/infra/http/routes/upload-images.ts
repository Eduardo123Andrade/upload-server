import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'

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
      await db.insert(schemas.uploads).values({
        name: request.body.name,
        remoteKey: `some-remote-key-${request.body.name}`,
        remoteUrl: 'some-remote-url',
      })
      return reply.status(201).send({ uploadId: 'some-upload-id' })
    }
  )
}
