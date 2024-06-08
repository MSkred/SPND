import type { Group } from "./server/utils/drizzle"

// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: int
    email: string
    firstname: string
    lastname: string
    picture: string
    locale: string
    createdAt: int
  }

  interface UserSession {
    // Add your own fields
    user: User
    groups: Group[]
  }
}

export {}