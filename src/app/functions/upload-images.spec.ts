import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { beforeEach } from 'node:test'
import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { db } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/shared'
import { InvalidFileFormatError } from '../errors'
import { uploadImages } from './upload-images'

describe('upload-images', () => {
  beforeEach(async () => {
    await db
      .delete(schemas.uploads)
      .where(eq(schemas.uploads.id, schemas.uploads.id))
  })

  beforeAll(() => {
    // Setup code if needed
    vi.mock('@/infra/storage/upload-file-to-storage', () => {
      return {
        uploadFileToStorage: vi.fn().mockImplementation(() => ({
          key: `${randomUUID()}.png`,
          url: 'http://example.com/image.png',
        })),
      }
    })
  })

  it('should be able to upload an image', async () => {
    const filename = `${randomUUID()}.png`

    //
    /**
     * SUT - System Under Test
     * defines the object or function being tested
     */

    const sut = await uploadImages({
      filename,
      contentType: 'image/png',
      contentStream: Readable.from([]),
    })

    expect(isRight(sut)).toBe(true)
    const result = await db
      .select()
      .from(schemas.uploads)
      .where(eq(schemas.uploads.name, filename))

    expect(result).toHaveLength(1)
  })

  it('should not be able to upload an invalid file', async () => {
    const filename = `${randomUUID()}.pdf`

    const sut = await uploadImages({
      filename,
      contentType: 'document/pdf',
      contentStream: Readable.from([]),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormatError)

    // expect(result).toHaveLength(1)
  })
})
