import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function TwoFactorAuthModal({ onCancel, onVerify }: {
    onCancel: () => void
    onVerify: (code: string) => void
}) {
    const [verificationCode, setVerificationCode] = useState('')

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="text-center">
                 <CardTitle>Verify Your Login</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                 <div className="text-center text-sm text-muted-foreground">
                    <p>Enter the 6-digit code from your authenticator app.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="verificationCode">Authenticator Code</Label>
                    <Input
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        id="verificationCode"
                    />
                </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                <Button
                    className="w-full"
                    disabled={verificationCode.length !== 6}
                    onClick={() => onVerify(verificationCode)}
                >
                    Verify
                </Button>
                <Button variant="outline" className="w-full" onClick={onCancel}>
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    )
}