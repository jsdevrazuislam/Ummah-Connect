import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to your register email. Please check your inbox and click the link to
              verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              If you don't see the email in your inbox, please check your spam folder or request a new verification
              link.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">Resend Verification Email</Button>
            <div className="text-center text-sm">
              <Link href="/login" className="inline-flex items-center text-primary hover:underline">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
