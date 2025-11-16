import { Readable } from 'node:stream'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'
import { Either, makeLeft, makeRight } from '@/shared'
import { InvalidFileFormatError } from '../errors'

/**
 * const uploadImageInput = z.object({
 *  filename: z.string(),
 *  contentType: z.string().transform(content => Number(content)),
 *  contentStream: z.instanceof(Readable),
 * })
 *
 * type UploadImageInput = z.infer<typeof uploadImageInput>
 * type UploadImageInput = z.output<typeof uploadImageInput>
 *
 * both of them make my UpdateImageInput.contentType to be a Number
 * because they are referent to the output of the transform function
 *
 * if I want infer the input type, I have to use z.input<typeof uploadImageInput>
 *
 */

const uploadImageInput = z.object({
  filename: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadImageInput = z.input<typeof uploadImageInput>

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

export const uploadImages = async (
  input: UploadImageInput
): Promise<Either<InvalidFileFormatError, { url: string }>> => {
  const { filename, contentType, contentStream } = uploadImageInput.parse(input)

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormatError())
  }

  // TODO - load to storage service

  await db.insert(schemas.uploads).values({
    name: filename,
    remoteKey: filename,
    remoteUrl: `https://example.com/${filename}-${Date.now()}`,
  })

  return makeRight({ url: 'https://example.com/some-image-url' })
}
