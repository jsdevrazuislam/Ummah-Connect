"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import type { NotificationPreferenceFormData } from "@/validation/auth.validation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notificationPreferences } from "@/lib/apis/auth";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";
import { notificationPreferenceSchema } from "@/validation/auth.validation";

function Notification() {
  const { user, setUser } = useStore();
  const { handleSubmit, control, setValue } = useForm<NotificationPreferenceFormData>({
    resolver: zodResolver(notificationPreferenceSchema),
    defaultValues: {

    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: notificationPreferences,
    onSuccess: (updateData) => {
      showSuccess("Settings Update Success");
      setUser(updateData?.data);
    },
    onError: (error) => {
      showError(error?.message);
    },
  });

  const onSubmit = (data: NotificationPreferenceFormData) => {
    const payload = {
      ...data,
    };
    mutate(payload);
  };

  useEffect(() => {
    setValue("commentPost", user?.notificationPreferences?.commentPost ?? false);
    setValue("dm", user?.notificationPreferences?.dm ?? false);
    setValue("emailNotification", user?.notificationPreferences?.emailNotification ?? false);
    setValue("islamicEvent", user?.notificationPreferences?.islamicEvent ?? false);
    setValue("likePost", user?.notificationPreferences?.likePost ?? false);
    setValue("mention", user?.notificationPreferences?.mention ?? false);
    setValue("newFollower", user?.notificationPreferences?.newFollower ?? false);
    setValue("prayerTimeNotification", user?.notificationPreferences?.prayerTimeNotification ?? false);
    setValue("pushNotification", user?.notificationPreferences?.pushNotification ?? false);
  }, [user]);

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
                  <Label htmlFor="push_notification" className="cursor-pointer">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Controller
                  name="pushNotification"
                  control={control}
                  render={({ field }) => (
                    <Switch id="push_notification" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notification" className="cursor-pointer">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Controller
                  name="emailNotification"
                  control={control}
                  render={({ field }) => (
                    <Switch id="email_notification" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prayer_time_notification" className="cursor-pointer">Prayer Time Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for prayer times</p>
                </div>
                <Controller
                  name="prayerTimeNotification"
                  control={control}
                  render={({ field }) => (
                    <Switch id="prayer_time_notification" checked={field.value} onCheckedChange={field.onChange} />
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
                    name={name as "dm" | "islamicEvent" | "likePost" | "commentPost" | "mention" | "newFollower" | "pushNotification" | "emailNotification" | "prayerTimeNotification"}
                    control={control}
                    render={({ field }) => (
                      <Switch id={id} checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              ))}
            </div>

            <Button disabled={isPending} className="mt-4">
              {isPending ? "loading..." : "Save Notification Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default Notification;
