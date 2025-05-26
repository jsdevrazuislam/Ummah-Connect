interface UserResponse {
  statusCode: number;
  data: Data;
  message: string;
  success: boolean;
}
interface ProfileUser{
  data: User
}
interface UpdateUserResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
}


interface Data {
  user: User;
  access_token: string;
  refresh_token: string;
}
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  avatar?: null;
  location?: null;
  website?: null;
  role: string;
  title?: null;
  refresh_token: string;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
  bio:string
  gender:string
  cover:string
  followers_count:number
  following_count:number
}

interface JwtResponsePayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
  role: 'user' | 'admin' | 'super-admin';
}
