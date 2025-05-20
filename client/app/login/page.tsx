import React from 'react'
import LoginPage from '@/app/login/login-form'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: "Login",
  description: "Login to your ummah connect account"
}


const Page = () => {
  return (
    <LoginPage />
  )
}

export default Page