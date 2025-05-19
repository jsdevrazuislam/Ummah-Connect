import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const hash_password = (password:string) =>{
    return bcrypt.hash(password, 10)
}

export const compare_password = (hash_password:string, password:string) =>{
    return bcrypt.compare(password, hash_password)
}

export const generate_access_token = (data:object) =>{
   return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET ?? '', { expiresIn: `${Number(process.env.ACCESS_TOKEN_EXPIRY)} days`})
}

export const generate_refresh_token = (data:object) =>{
   return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET ?? '', { expiresIn: `${Number(process.env.REFRESH_TOKEN_EXPIRY)} days`})
}

export const decode_token = (token:string, secret_key:string)  =>{
   return jwt.verify(token, secret_key)
}