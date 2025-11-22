import { stringify } from 'csv-stringify'
import { asc, count, desc, ilike } from 'drizzle-orm'
import { PassThrough, Transform } from 'stream'
import { pipeline } from 'stream/promises'
import { z } from 'zod'
import { ur } from 'zod/locales'
import { db, pg } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { type Either, makeRight } from '@/shared'

const getUploadsInput = z.object({
  searchQuery: z.string().optional(),
})

type GetUploadsInput = z.input<typeof getUploadsInput>
type GetUploadsOutput = {
  reportUrl: string
}

/**
 * never means this function never fails
 * or not expected to fail
 *
 */

export const exportUploads = async (
  input: GetUploadsInput
): Promise<Either<never, GetUploadsOutput>> => {
  const { searchQuery } = input

  const { sql, params } = db
    .select({
      id: schemas.uploads.id,
      name: schemas.uploads.name,
      remoteUrl: schemas.uploads.remoteUrl,
      createdAt: schemas.uploads.createdAt,
    })
    .from(schemas.uploads)
    .where(
      searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined
    )
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(2)
  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'remote_url', header: 'Remote URL' },
      { key: 'created_at', header: 'Created At' },
    ],
  })

  /**
   * PassThrough is a type of stream that simply passes
   * the input data to the output without any modification.
   *
   * in this case, we use it to pipe data from the database cursor
   * to the uploadFileToStorage function.
   *
   * This way, we avoid storing the entire CSV file in memory or
   * on disk, and instead stream it directly to the storage service.
   *
   * It is work because uploadFileToStorage function accepts a stream as input
   * and PassThrough extends Stream class.
   * That is necessary because uploadFileToStorage expects a stream.
   */
  const uploadToStorageStream = new PassThrough()

  const convertToSvgPipeLine = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks, encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }
        callback()
      },
    }),
    csv,
    uploadToStorageStream
  )

  const uploadToStorage = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    filename: `${Date.now()}-uploads.csv`,
    contentStream: uploadToStorageStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToSvgPipeLine])

  return makeRight({ reportUrl: url })
}
