"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChangePasswordFormData, changePasswordSchema } from "@/validation/auth.validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/store"
import { useMutation } from "@tanstack/react-query"
import { changePassword } from "@/lib/apis/auth"
import { toast } from "sonner"


const ChangePassword = () => {

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const router = useRouter()
  const { logout } = useStore()


  const { isPending, mutate } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password Update Successfully")
      logout()
      router.push('/login')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleChangePasswordHandler = (data: ChangePasswordFormData) => {

    const payload = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    }
    mutate(payload)
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(handleChangePasswordHandler)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" {...register('oldPassword')} error={errors?.oldPassword?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" {...register('newPassword')} error={errors?.newPassword?.message} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" {...register('confirmPassword')} error={errors?.confirmPassword?.message} />
              </div>
            </div>
            <Button disabled={isPending} type="submit" className="mt-4">
              {isPending ? 'loading..' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePassword