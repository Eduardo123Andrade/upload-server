import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import z from 'zod'
import { env } from '@/env'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
  folder: z.enum(['images', 'downloads']).optional(),
  filename: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export const uploadFileToStorage = async (input: UploadFileToStorageInput) => {
  const { folder, filename, contentStream } =
    uploadFileToStorageInput.parse(input)

  const fileExtension = extname(filename)

  const fileNameWithoutExtension = basename(filename)

  const sanitizedFileName = fileNameWithoutExtension
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')

  const sanitizedFileNameWithExtension = `${sanitizedFileName}${fileExtension}`

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
    },
  })

  await upload.done()

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_URL).toString(),
  }
}
