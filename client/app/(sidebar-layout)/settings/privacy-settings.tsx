"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PrivacyFormData, privacySettingsSchema } from '@/validation/auth.validation'
import { Controller, useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updatePrivacySetting } from '@/lib/apis/auth'

const PrivacySettings = () => {

    const { user, setUser } = useAuthStore()
    const { handleSubmit, control, setValue } = useForm<PrivacyFormData>({
        resolver: zodResolver(privacySettingsSchema),
        defaultValues: {
            active_status: user?.privacy_settings?.active_status ?? false,
            location_share: user?.privacy_settings?.location_share ?? false,
            message: user?.privacy_settings?.message ?? 'followers',
            post_see: user?.privacy_settings?.post_see ?? 'everyone',
            private_account: user?.privacy_settings?.private_account ?? false,
            read_receipts: user?.privacy_settings?.read_receipts ?? false,

        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: updatePrivacySetting,
        onSuccess: (updateData) => {
            toast.success("Settings Update Success")
            setUser(updateData?.data)
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const onSubmit = (data: PrivacyFormData) => {
        const payload = {
            ...data
        }
        mutate(payload);
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your account privacy and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor='private_account' className='cursor-pointer'>Private Account</Label>
                                <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
                            </div>
                            <Controller
                                name='private_account'
                                control={control}
                                render={({ field }) => (
                                    <Switch id='private_account' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor='active_status' className='cursor-pointer'>Activity Status</Label>
                                <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
                            </div>
                            <Controller
                                name='active_status'
                                control={control}
                                render={({ field }) => (
                                    <Switch id='active_status' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor='read_receipts' className='cursor-pointer'>Read Receipts</Label>
                                <p className="text-sm text-muted-foreground">Let others know when you've read their messages</p>
                            </div>
                            <Controller
                                name='read_receipts'
                                control={control}
                                render={({ field }) => (
                                    <Switch id='read_receipts' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor='location_share' className='cursor-pointer'>Location Sharing</Label>
                                <p className="text-sm text-muted-foreground">Allow sharing your location in posts</p>
                            </div>
                            <Controller
                                name='location_share'
                                control={control}
                                render={({ field }) => (
                                    <Switch id='location_share' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Who can see your posts</Label>
                        <Controller
                            name='post_see'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everyone">Everyone</SelectItem>
                                        <SelectItem value="followers">Followers only</SelectItem>
                                        <SelectItem value="close-friends">Close friends</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                    </div>

                    <div className="space-y-2">
                        <Label>Who can message you</Label>
                        <Controller
                            name='message'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everyone">Everyone</SelectItem>
                                        <SelectItem value="followers">Followers only</SelectItem>
                                        <SelectItem value="nobody">Nobody</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <Button type='submit' disabled={isPending}>
                        {isPending ? 'Updating...' : 'Save Privacy Settings'}
                    </Button>
                </CardContent>
            </Card>
        </form>
    )
}

export default PrivacySettings