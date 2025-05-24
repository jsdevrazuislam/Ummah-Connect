"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ArrowLeft, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [modalEmail, setModalEmail] = useState("")

    useEffect(() => {
        const emailFromUrl = searchParams.get("email")
        if (emailFromUrl) {
            setEmail(decodeURIComponent(emailFromUrl))
        }
    }, [searchParams])

    const handleResendVerification = async (emailToSend?: string) => {
        const targetEmail = emailToSend || email

        if (!targetEmail) {
            setIsModalOpen(true)
            return
        }

        setIsResending(true)

        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: targetEmail }),
            })

            if (response.ok) {
                toast.success("Verification email sent", {
                    description: `A new verification link has been sent to ${targetEmail}`,
                })
                setIsModalOpen(false)
                setModalEmail("")
            } else {
                const error = await response.json()
                toast.error("Failed to send email", {
                    description: error.message || "Please try again later",
                })
            }
        } catch (error) {
            toast.error("Network error", {
                description: "Please check your connection and try again",
            })
        } finally {
            setIsResending(false)
        }
    }

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (modalEmail.trim()) {
            handleResendVerification(modalEmail.trim())
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Ummah Connect</h1>
                    <p className="text-muted-foreground mt-2">Email verification</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="text-center">Check Your Email</CardTitle>
                        <CardDescription className="text-center">
                            {email ? (
                                <>
                                    We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link
                                    to verify your email address.
                                </>
                            ) : (
                                "We've sent a verification link to your email address. Please check your inbox and click the link to verify your email."
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            If you don't see the email in your inbox, please check your spam folder or request a new verification
                            link.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" onClick={() => handleResendVerification()} disabled={isResending}>
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Resend Verification Email
                                </>
                            )}
                        </Button>
                        <div className="text-center text-sm">
                            <Link href="/login" className="inline-flex items-center text-primary hover:underline">
                                <ArrowLeft className="mr-1 h-3 w-3" />
                                Back to login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Email Input Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Email Address</DialogTitle>
                        <DialogDescription>Please enter your email address to resend the verification link.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleModalSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setModalEmail("")
                                }}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isResending || !modalEmail.trim()} className="w-full sm:w-auto">
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Verification Email"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
