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
  }
}

export {}