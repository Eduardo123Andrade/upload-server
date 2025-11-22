import { randomUUID } from 'crypto'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import * as upload from '@/infra/storage/upload-file-to-storage'
import { isRight, unwrapEither } from '@/shared'
import { makeUpload } from '@/test/factories/make-upload'
import { exportUploads } from './export-uploads'

describe('exportUploads', () => {
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

  it('should be able to export uploads', async () => {
    /**
     * spy => monitoring something
     * stub => change the behavior of something\
     *
     * those are functions used in tests to grant the
     * function behavior
     */

    /**
     * the method spyOn receive an object and a method from this object
     * because that I imported (* as upload), to force my import be an object
     */
    const uploadStub = vi
      .spyOn(upload, 'uploadFileToStorage')
      .mockImplementationOnce(async () => {
        return {
          key: `${randomUUID()}.cvs`,
          url: 'http://example.com/file.csv',
        }
      })

    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.wep` })
    const upload2 = await makeUpload({ name: `${namePattern}.wep` })
    const upload3 = await makeUpload({ name: `${namePattern}.wep` })
    const upload4 = await makeUpload({ name: `${namePattern}.wep` })
    const upload5 = await makeUpload({ name: `${namePattern}.wep` })

    const sut = await exportUploads({
      searchQuery: namePattern,
    })

    /**
     * calls => is a array of call, each element means the time that
     * uploadFileToStorage to be called
     *
     * then mock.calls[0] => is the first call
     *
     * the second [0] is the first element of function parameters
     * in this case is: (input: UploadFileToStorageInput) the input
     *
     * in the end I get the property of this parameter: contentStream
     *
     * then I got the contentStream from the first method input
     * of the first call
     *
     */
    const generatedCSVStream = uploadStub.mock.calls[0][0].contentStream

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []

      generatedCSVStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      generatedCSVStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      })

      generatedCSVStream.on('error', err => {
        reject(err)
      })
    })

    const csvAsArray = csvAsString
      .trim()
      .split('\n')
      .map(row => row.split(','))

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      reportUrl: 'http://example.com/file.csv',
    })

    expect(csvAsArray).toEqual([
      ['ID', 'Name', 'Remote URL', 'Created At'],
      [upload1.id, upload1.name, upload1.remoteUrl, expect.any(String)],
      [upload2.id, upload2.name, upload2.remoteUrl, expect.any(String)],
      [upload3.id, upload3.name, upload3.remoteUrl, expect.any(String)],
      [upload4.id, upload4.name, upload4.remoteUrl, expect.any(String)],
      [upload5.id, upload5.name, upload5.remoteUrl, expect.any(String)],
    ])
  })
})
