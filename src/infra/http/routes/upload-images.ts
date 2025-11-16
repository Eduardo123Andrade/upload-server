import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { uploadImages } from '@/app/functions'
import { db } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'
import { isRight, unwrapEither } from './../../../shared/either'

export const uploadImagesRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({ uploadId: z.string() }),
          400: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      })

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'File is required' })
      }

      const result = await uploadImages({
        filename: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      if (isRight(result)) {
        console.log(result?.right?.url)
        console.log(unwrapEither(result).url)
        return reply.status(201).send()
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidFileFormatError': {
          return reply.status(400).send({ message: error.message })
        }
        default:
          return reply.status(500).send({ message: 'Database error' })
      }
    }
  )
}
