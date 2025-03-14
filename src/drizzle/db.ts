
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"


// export const db = drizzle({
//   schema,
//   connection: {
//     password: env.DB_PASSWORD,
//     user: env.DB_USER,
//     database: env.DB_NAME,
//     host: env.DB_HOST,
//   },
// })

export const db = drizzle({
  schema,
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true
  }
});

// Export types
export type User = typeof schema.UserTable.$inferSelect
export type NewUser = typeof schema.UserTable.$inferInsert