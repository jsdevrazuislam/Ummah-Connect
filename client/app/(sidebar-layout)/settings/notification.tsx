"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/store'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { notificationPreferences } from '@/lib/apis/auth'
import { toast } from 'sonner'
import { NotificationPreferenceFormData, notificationPreferenceSchema } from '@/validation/auth.validation'

const Notification = () => {

    const { user, setUser } = useAuthStore()
    const { handleSubmit, control, setValue } = useForm<NotificationPreferenceFormData>({
        resolver: zodResolver(notificationPreferenceSchema),
        defaultValues:{

        }
    });

    const { mutate, isPending } = useMutation({
        mutationFn: notificationPreferences,
        onSuccess: (updateData) => {
            toast.success("Settings Update Success")
            setUser(updateData?.data)
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const onSubmit = (data: NotificationPreferenceFormData) => {
        const payload = {
            ...data
        }
        mutate(payload);
    };


    useEffect(() => {
        setValue('comment_post', user?.notification_preferences?.comment_post ?? false)
        setValue('dm', user?.notification_preferences?.dm ?? false)
        setValue('email_notification', user?.notification_preferences?.email_notification ?? false)
        setValue('islamic_event', user?.notification_preferences?.islamic_event ?? false)
        setValue('like_post', user?.notification_preferences?.like_post ?? false)
        setValue('mention', user?.notification_preferences?.mention ?? false)
        setValue('new_follower', user?.notification_preferences?.new_follower ?? false)
        setValue('prayer_time_notification', user?.notification_preferences?.prayer_time_notification ?? false)
        setValue('push_notification', user?.notification_preferences?.push_notification ?? false)
    }, [user])

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how and when you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor='push_notification' className='cursor-pointer'>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                                </div>
                                <Controller
                                    name='push_notification'
                                    control={control}
                                    render={({ field }) => (
                                        <Switch id='push_notification' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor='email_notification' className='cursor-pointer'>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                </div>
                                <Controller
                                    name='email_notification'
                                    control={control}
                                    render={({ field }) => (
                                        <Switch id='email_notification' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor='prayer_time_notification' className='cursor-pointer'>Prayer Time Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications for prayer times</p>
                                </div>
                                <Controller
                                    name='prayer_time_notification'
                                    control={control}
                                    render={({ field }) => (
                                        <Switch id='prayer_time_notification' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mt-3">
                            <h3 className="text-sm font-medium">Notify me about:</h3>
                            <div className="grid gap-2">
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='like_post'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='likes' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="likes" className='cursor-pointer'>Likes on my posts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='comment_post'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='comments' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="comments" className='cursor-pointer'>Comments on my posts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='mention'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='mentions' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="mentions" className='cursor-pointer'>Mentions</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='new_follower'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='follows' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="follows" className='cursor-pointer'>New followers</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='dm'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='messages' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="messages" className='cursor-pointer'>Direct messages</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name='islamic_event'
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id='events' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor="events" className='cursor-pointer'>Islamic events and holidays</Label>
                                </div>
                            </div>
                        </div>
                        <Button disabled={isPending} className='mt-4'>
                            {isPending ? 'loading...' : 'Save Notification Settings'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default Notification