export interface JwtResponse{
  id: number,
  email: string,
  iat: number,
  exp: number
}

export interface User {
    id: number
    username: string
    full_name: string
    email: string
    avatar: string
    location: string
    role: string
    website: string
    title: string
    refresh_token: string
    is_verified: boolean
    createdAt?: string
    updatedAt?: string
}