"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Mic, MicOff, Settings, Video, VideoIcon, VideoOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { StreamFormData } from "@/validation/stream.validation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { startLive } from "@/lib/apis/stream";
import { showError } from "@/lib/toast";
import { useStore } from "@/store/store";
import { streamSchema } from "@/validation/stream.validation";

export default function CreateLiveStreamPage() {
  const router = useRouter();
  const { user } = useStore();
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { isPending, mutate } = useMutation({
    mutationFn: startLive,
    onSuccess: (data) => {
      router.push(`/live/${data?.data?.stream?.id}`);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const form = useForm<StreamFormData>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "education",
      tags: "",
      enableChat: true,
      saveRecording: true,
      notifyFollowers: true,
    },
  });

  const { handleSubmit, watch, register, control } = form;
  const titleValue = watch("title");
  const categoryValue = watch("category");

  const onSubmit = (data: StreamFormData) => {
    mutate({
      title: data.title,
      description: data.description,
      tags: data?.tags?.split(","),
      notifyFollowers: data?.notifyFollowers,
      saveRecording: data?.saveRecording,
      category: data?.category,
      enableChat: data?.enableChat,
    });
  };

  const testDevices = async () => {
    try {
      setIsTestingDevices(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsMicActive(true);
      setIsCameraActive(true);
    }
    catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopTestingDevices = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTestingDevices(false);
    setIsMicActive(false);
    setIsCameraActive(false);
    setStream(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      <div className="px-6 mt-4">
        <Link href="/live" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Live
        </Link>
      </div>

      <h1 className="text-2xl font-bold px-6 mb-6">Go Live</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Details</CardTitle>
                <CardDescription>Provide information about your live stream</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title*</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your stream"
                    {...register("title")}
                    error={form?.formState?.errors?.title?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this stream about?"
                    {...register("description")}
                    rows={4}
                    error={form?.formState?.errors?.description?.message}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="quran">Quran</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="charity">Charity</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g. Islamic Finance, Halal Investing"
                      {...register("tags")}
                      error={form?.formState?.errors?.tags?.message}
                    />
                  </div>
                </div>

                <div className="space-y-2 ">
                  <Label>Stream Settings</Label>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableChat">Enable Chat</Label>
                        <p className="text-sm text-muted-foreground">Allow viewers to chat during your stream</p>
                      </div>
                      <Switch
                        id="enableChat"
                        checked={watch("enableChat")}
                        onCheckedChange={checked => form.setValue("enableChat", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="saveRecording">Save Recording</Label>
                        <p className="text-sm text-muted-foreground">Save this stream for viewers to watch later</p>
                      </div>
                      <Switch
                        id="saveRecording"
                        checked={watch("saveRecording")}
                        onCheckedChange={checked => form.setValue("saveRecording", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyFollowers">Notify Followers</Label>
                        <p className="text-sm text-muted-foreground">Send notification when you go live</p>
                      </div>
                      <Switch
                        id="notifyFollowers"
                        checked={watch("notifyFollowers")}
                        onCheckedChange={checked => form.setValue("notifyFollowers", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/live")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                <Video className="h-4 w-4" />
                {isPending ? "Starting..." : "Start Stream"}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stream Preview</CardTitle>
              <CardDescription>Preview how your stream will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden">
                {isTestingDevices
                  ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )
                  : (
                      <Video className="h-12 w-12 text-muted-foreground" />
                    )}
              </div>
              <h3 className="font-medium line-clamp-1">{titleValue || "Your Stream Title"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{user?.fullName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{categoryValue || "Category"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Stream Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isTestingDevices
                ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={testDevices}
                    >
                      <Settings className="h-4 w-4" />
                      Test Camera & Microphone
                    </Button>
                  )
                : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>Microphone</Label>
                          <div className={`h-2 w-2 rounded-full ${isMicActive ? "bg-green-500" : "bg-destructive"}`} />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMicActive(!isMicActive)}
                        >
                          {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>Camera</Label>
                          <div className={`h-2 w-2 rounded-full ${isCameraActive ? "bg-green-500" : "bg-destructive"}`} />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsCameraActive(!isCameraActive)}
                        >
                          {isCameraActive ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={stopTestingDevices}
                      >
                        Stop Testing
                      </Button>
                    </div>
                  )}

              <p className="text-xs text-muted-foreground">
                Make sure your camera and microphone are properly set up before starting your stream.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
