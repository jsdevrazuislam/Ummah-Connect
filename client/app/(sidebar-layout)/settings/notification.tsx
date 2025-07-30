"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/store/store'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { notificationPreferences } from '@/lib/apis/auth'
import { toast } from 'sonner'
import { NotificationPreferenceFormData, notificationPreferenceSchema } from '@/validation/auth.validation'

const Notification = () => {

    const { user, setUser } = useStore()
    const { handleSubmit, control, setValue } = useForm<NotificationPreferenceFormData>({
        resolver: zodResolver(notificationPreferenceSchema),
        defaultValues: {

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

                        <div className="space-y-4 mt-3">
                            {[
                                {
                                    name: "like_post",
                                    id: "likes",
                                    label: "Likes on my posts",
                                    description: "Get notified when someone likes your post",
                                },
                                {
                                    name: "comment_post",
                                    id: "comments",
                                    label: "Comments on my posts",
                                    description: "Get notified when someone comments on your post",
                                },
                                {
                                    name: "mention",
                                    id: "mentions",
                                    label: "Mentions",
                                    description: "Get notified when someone mentions you",
                                },
                                {
                                    name: "new_follower",
                                    id: "follows",
                                    label: "New followers",
                                    description: "Get notified when someone follows you",
                                },
                                {
                                    name: "dm",
                                    id: "messages",
                                    label: "Direct messages",
                                    description: "Get notified when you receive a new message",
                                },
                                {
                                    name: "islamic_event",
                                    id: "events",
                                    label: "Islamic events and holidays",
                                    description: "Updates about important Islamic days and events",
                                },
                            ].map(({ name, id, label, description }) => (
                                <div key={name} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                                        <p className="text-sm text-muted-foreground">{description}</p>
                                    </div>
                                    <Controller
                                        name={name as "dm" | "islamic_event" | "like_post" | "comment_post" | "mention" | "new_follower" | "push_notification" | "email_notification" | "prayer_time_notification"}
                                        control={control}
                                        render={({ field }) => (
                                            <Switch id={id} checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                </div>
                            ))}
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