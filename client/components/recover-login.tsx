"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, ChevronDown } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { loginRecoverySchema, RecoveryLoginFormData } from "@/validation/auth.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { recoverLogin, recoverLoginWithEmail, requestOtp } from "@/lib/apis/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/store"
import { validateEmail } from "@/lib/utils"



export function RecoveryLogin({
    setShowRecoveryModel,
    showRecoveryModel
}: {
    setShowRecoveryModel: Dispatch<SetStateAction<boolean>>,
    showRecoveryModel: boolean
}) {

    const router = useRouter()
    const { setLogin } = useAuthStore()
    const { mutate, isPending } = useMutation({
        mutationFn: recoverLogin,
        onSuccess: (userData) => {
            setShowRecoveryModel(false)
            const data = userData?.data
            setLogin(data.access_token, data.refresh_token, data.user)
            toast.success("Login successfully")
            router.push("/")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const { mutate:mnVerify, isPending: loading } = useMutation({
        mutationFn: recoverLoginWithEmail,
        onSuccess: (userData) => {
            setShowRecoveryModel(false)
            const data = userData?.data
            setLogin(data.access_token, data.refresh_token, data.user)
            toast.success("Login successfully")
            router.push("/")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const { mutate: reqOtp, isPending: otpLoading } = useMutation({
        mutationFn: requestOtp,
        onSuccess: () => {
            toast.success("OTP sent to your email")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<RecoveryLoginFormData>({
        resolver: zodResolver(loginRecoverySchema),
        defaultValues: {
            activeMethod: 'recovery'
        }
    });
    const activeMethod = watch('activeMethod')
    const emailOrUsername = watch('emailOrUsername')

    const handleRequestOtp = () => {
        if(!validateEmail(emailOrUsername)) return toast.error("Email required!")
            reqOtp(emailOrUsername)
    }

    const onSubmit = (data: RecoveryLoginFormData) => {
        if(activeMethod === 'recovery'){
            mutate({ emailOrUsername: data.emailOrUsername, recoveryCode: data.recoveryCode })
        } else {
            mnVerify({ email: data.emailOrUsername, otpCode: data.otp })
        }
    }

    return (
        <Dialog open={showRecoveryModel} onOpenChange={setShowRecoveryModel}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Account Recovery
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="emailOrUsername">Email or Username</Label>
                            <Input
                                id="emailOrUsername"
                                className="mt-2"
                                placeholder="example@gmail.com or username"
                                {...register("emailOrUsername")}
                                error={errors.emailOrUsername?.message}
                            />
                        </div>

                        {activeMethod === 'recovery' && (
                            <div>
                                <Label htmlFor="recoveryCode">Recovery Code</Label>
                                <Input
                                    id="recoveryCode"
                                    placeholder="Enter your 16-digit recovery code"
                                    className="mt-2"
                                    {...register("recoveryCode")}
                                    error={errors.recoveryCode?.message}
                                />
                            </div>
                        )}

                        {activeMethod === 'otp' && (
                            <div>
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    {...register("otp")}
                                    error={errors.otp?.message}
                                />
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-sm h-auto p-0 mt-1"
                                    type="button"
                                    onClick={handleRequestOtp}
                                    disabled={otpLoading}
                                >
                                    Resend code
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <Button
                                variant="link"
                                type="button"
                                className="text-sm p-0 h-auto flex items-center"
                                onClick={() => setValue("activeMethod", activeMethod === 'recovery' ? 'otp' : 'recovery')}
                            >
                                <ChevronDown className="h-4 w-4 mr-1" />
                                {activeMethod === 'recovery' ? 'Use verification code instead' : 'Use recovery code instead'}
                            </Button>

                            {activeMethod === 'otp' && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={handleRequestOtp}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? 'Sending...' : 'Request OTP'}
                                </Button>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || loading}
                        >
                            {isPending || loading ? 'Verifying...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}