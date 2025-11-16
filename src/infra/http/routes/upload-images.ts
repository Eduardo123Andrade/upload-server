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
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({ uploadId: z.string() }),
          409: z
            .object({ message: z.string() })
            .describe('Image already exists'),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      })

      const name = uploadedFile?.fieldname || 'unnamed'

      await db.insert(schemas.uploads).values({
        name: name,
        remoteKey: `some-remote-key-${name}-${Date.now()}`,
        remoteUrl: 'some-remote-url',
      })
      return reply.status(201).send({ uploadId: 'some-upload-id' })
    }
  )
}
