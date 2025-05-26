"use client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/store/store"
import { Loader2, Smartphone, Mail, Key, Phone } from "lucide-react"
import { useState } from "react"

export function TwoFactorAuth() {

    const { user } = useAuthStore()
    const [isEnabled, setIsEnabled] = useState(user?.is_two_factor_enabled)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'app' | 'email' | 'sms'>('app')
    const [verificationCode, setVerificationCode] = useState('')

    const handleEnable2FA = () => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsEnabled(true)
            setIsLoading(false)
        }, 1500)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="2fa-toggle">Enable 2FA</Label>
                        <p className="text-sm text-muted-foreground">
                            {isEnabled ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                    <Switch
                        id="2fa-toggle"
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                            if (!checked) {
                                setIsEnabled(false)
                            } else {
                                handleEnable2FA()
                            }
                        }}
                        disabled={isLoading}
                    />
                </div>

                {isEnabled && (
                    <div className="space-y-4">
                        <div className="flex border rounded-lg overflow-hidden">
                            <Button
                                variant={activeTab === 'app' ? 'default' : 'ghost'}
                                className="flex-1 rounded-none"
                                onClick={() => setActiveTab('app')}
                            >
                                <Smartphone className="h-4 w-4 mr-2" />
                                Authenticator App
                            </Button>
                            <Button
                                variant={activeTab === 'email' ? 'default' : 'ghost'}
                                className="flex-1 rounded-none"
                                onClick={() => setActiveTab('email')}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                            </Button>
                            <Button
                                variant={activeTab === 'sms' ? 'default' : 'ghost'}
                                className="flex-1 rounded-none"
                                onClick={() => setActiveTab('sms')}
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                SMS
                            </Button>
                        </div>

                        {activeTab === 'app' && (
                            <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Set up Authenticator App</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Install Google Authenticator or Authy</li>
                                        <li>Scan this QR code with your app</li>
                                        <li>Enter the 6-digit code below</li>
                                    </ol>
                                    <div className="flex justify-center my-4">
                                        <div className="w-40 h-40 bg-muted border rounded flex items-center justify-center">
                                            <span className="text-muted-foreground">QR Code</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="verification-code">Verification Code</Label>
                                    <Input
                                        id="verification-code"
                                        placeholder="Enter 6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Email Verification</h4>
                                    <p className="text-sm">
                                        We'll send a verification code to your registered email address.
                                    </p>
                                </div>
                                <Button className="w-full">
                                    Send Verification Code
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {isEnabled && (
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsEnabled(false)}>
                        Disable 2FA
                    </Button>
                    <Button disabled={verificationCode.length !== 6}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify & Save'
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}