import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const uploads = pgTable('uploads', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  remoteKey: text('remote_key').notNull().unique(),
  remoteUrl: text('remote_url').notNull(),
  /**
   * withTimezone is to save the timestamp with timezone information
   * but use this only if you need operate with this field
   */
  //   createdAt: timestamp('created_at', { withTimezone: true })
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updateAt: timestamp('updated_at').notNull().defaultNow(),
})
