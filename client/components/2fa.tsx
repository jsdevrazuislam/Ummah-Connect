"use client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { disable2FA, enable2FA, verify2FA } from "@/lib/apis/auth"
import { useStore } from "@/store/store"
import { useMutation } from "@tanstack/react-query"
import { Loader2, Key } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { BackupCodes } from "@/components/recover-backcodes"
import Image from "next/image"

export function TwoFactorAuth() {

    const { user } = useStore()
    const [is2FAActive, setIs2FAActive] = useState(user?.is_two_factor_enabled)
    const [showVerificationSetup, setShowVerificationSetup] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [qrCode, setQrCode] = useState<string | undefined>(undefined) 
    const [showBackupCode, setShowBackupCode] = useState(false)
    const [backUpCodes, setBackUpCodes] = useState<string[]>([])

    const { mutate, isPending } = useMutation({
        mutationFn: enable2FA,
        onSuccess: (qrData) => {
            setQrCode(qrData?.data?.qrCode)
            setShowVerificationSetup(true) 
        },
        onError: (error) => {
            toast.error(error.message)
            setIs2FAActive(false); 
            setShowVerificationSetup(false);
        }
    })

    const { mutate: muFun, isPending: isLoading } = useMutation({
        mutationFn: verify2FA,
        onSuccess: (data) => {
            toast.success("2FA verified and enabled successfully")
            setIs2FAActive(true)
            setShowVerificationSetup(false) 
            setBackUpCodes(data?.data)
            setShowBackupCode(true)
            setQrCode(undefined); 
            setVerificationCode('');
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: disFun, isPending: disLoading } = useMutation({
        mutationFn: disable2FA,
        onSuccess: () => {
            toast.success("2FA disabled successfully")
            setIs2FAActive(false) 
            setShowVerificationSetup(false) 
            setQrCode(undefined); 
            setVerificationCode(''); 
        },
        onError: (error) => {
            toast.error(error.message)
            setIs2FAActive(true);
        }
    })

    const handleToggle2FA = (checked: boolean) => {
        if (!checked) {
            handleDisable2FA()
        } else {
            if (!is2FAActive && !showVerificationSetup) {
                mutate()
            }
        }
    }

    const handleEnable2FAVerify = () => {
        muFun(verificationCode)
    }

    const handleDisable2FA = () => {
        disFun()
    }

    return (
    showBackupCode ? <BackupCodes backUpCodes={backUpCodes} setShowBackupCode={setShowBackupCode} /> :  <Card>
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
                            {is2FAActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                    <Switch
                        id="2fa-toggle"
                        checked={is2FAActive} 
                        onCheckedChange={handleToggle2FA}
                        disabled={isPending || disLoading}
                    />
                </div>

                {showVerificationSetup && qrCode && (
                    <>
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
                                        <Image width={160} height={160} src={qrCode} alt="2FA QR Code" className="w-full h-full" />
                                    </div>
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
                                className="mt-2"
                                disabled={isLoading} 
                            />
                        </div>
                    </>
                )}
            </CardContent>

            <CardFooter className="flex justify-between">
                {is2FAActive && !showVerificationSetup ? ( 
                    <Button disabled={disLoading} variant="outline" onClick={handleDisable2FA}>
                        {disLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Disabling...
                            </>
                        ) : (
                            'Disable 2FA'
                        )}
                    </Button>
                ) : (
                    showVerificationSetup && (
                        <Button
                            onClick={handleEnable2FAVerify}
                            disabled={verificationCode.length !== 6 || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Save'
                            )}
                        </Button>
                    )
                )}
            </CardFooter>
        </Card>
    )
}