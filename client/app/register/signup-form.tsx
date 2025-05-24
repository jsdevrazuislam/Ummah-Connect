"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { registerSchema, SignupFormData } from "@/validation/auth.validation"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/lib/apis/auth"
import { toast } from "sonner"
import { LoadingOverlay } from "@/components/loading-overlay"

const SignupForm = () => {

    const { register, handleSubmit, control, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(registerSchema),
    });
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationFn: registerUser,
        onSuccess: (_, variable) => {
            toast.success("Register successfully")
            router.push(`/verify-email?email=${variable.email}`)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const onSubmit = (data: SignupFormData) => {
        const payload = {
            full_name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            password: data.password,
            username: data.username
        }
        mutate(payload)
    }

    return (
        <>
            <LoadingOverlay loading={isPending} />
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create an Account</CardTitle>
                        <CardDescription>Enter your details to create your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input id="first-name" placeholder="Muhammad" {...register("first_name")} error={errors.first_name?.message} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input id="last-name" placeholder="Abdullah" {...register("last_name")} error={errors.last_name?.message} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="m_abdullah"  {...register("username")} error={errors.username?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m.abdullah@example.com" {...register("email")} error={errors.email?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register("password")} error={errors.password?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" {...register("confirm_password")} error={errors.confirm_password?.message} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                control={control}
                                name="termsAccepted"
                                render={({ field: { onChange, value } }) => (
                                    <Checkbox id="terms" checked={value} onCheckedChange={(e) => onChange(e)} />
                                )}
                            />
                            <Label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.termsAccepted && (
                            <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type='submit' className="w-full">Register</Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </>
    )
}

export default SignupForm