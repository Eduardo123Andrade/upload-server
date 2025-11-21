import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schemas } from '@/infra/db/schemas'

export const makeUpload = async (
  overrides?: Partial<InferInsertModel<typeof schemas.uploads>>
) => {
  const fileName = faker.system.fileName()

  const result = await db
    .insert(schemas.uploads)
    .values({
      name: `${fileName}`,
      remoteKey: `images/${fileName}.png`,
      remoteUrl: `http://example.com/images/${fileName}.png`,
      createdAt: new Date(),
      ...overrides,
    })
    .returning()

  return result[0]
}
