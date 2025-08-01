"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { UserProfileFormData } from "@/validation/auth.validation";

import ProfileLoading from "@/app/[...username]/loading";
import { ImageUpload } from "@/components/image-upload";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateCurrentUser } from "@/lib/apis/auth";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";
import { userProfileSchema } from "@/validation/auth.validation";

function AccountForm() {
  const [loading, setLoading] = useState(true);
  const { setUser, user } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, setValue, control, handleSubmit, formState: { errors } } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });
  const [selectAvatar, setSelectAvatar] = useState("");
  const [cover, setCover] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updateUser) => {
      showSuccess("Update Profile Success");
      setUser(updateUser.data);
    },
    onError: (error) => {
      showError(error?.message);
    },
  });

  const onSubmit = (data: UserProfileFormData) => {
    const formData = new FormData();
    if (data?.avatar) {
      formData.append("avatar", data.avatar);
    }
    if (data?.cover) {
      formData.append("cover", data.cover);
    }
    formData.append("website", data?.website ?? "");
    formData.append("bio", data?.bio ?? "");
    formData.append("email", data?.email ?? "");
    formData.append("fullName", data?.fullName ?? "");
    formData.append("gender", data?.gender ?? "");
    formData.append("location", data?.location ?? "");
    formData.append("username", data?.username ?? "");
    mutate(formData);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file)
      return;

    if (!file.type.startsWith("image/")) {
      showError("Invalid file type", {
        description: "Please select an image file (JPG, PNG, or GIF)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", {
        description: "Please select an image smaller than 5MB",
      });
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setValue("cover", file);
    setCover(imageUrl);
  };

  const handleImageSelect = (imageUrl: File) => {
    setValue("avatar", imageUrl);
    setSelectAvatar(URL.createObjectURL(imageUrl));
  };

  useEffect(() => {
    setSelectAvatar(user?.avatar ?? "");
    setCover(user?.cover ?? "");
    setValue("website", user?.website ?? "");
    setValue("bio", user?.bio ?? "");
    setValue("email", user?.email ?? "");
    setValue("fullName", user?.fullName ?? "");
    setValue("gender", user?.gender ?? "");
    setValue("location", user?.location ?? "");
    setValue("username", user?.username ?? "");
  }, [user]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading
        ? <ProfileLoading />
        : (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information and settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Cover Photo</Label>
                      <p className="text-sm text-muted-foreground">
                        This will be displayed on your profile. Recommended size: 1200x300px
                      </p>
                    </div>

                    <div className="relative group">
                      <div className="relative w-full h-[300px] bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg overflow-hidden border border-border">
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                          aria-label="Upload image"
                        />

                        {
                          cover && (
                            <Image
                              src={cover}
                              alt="Cover photo"
                              className="w-full h-full object-cover"
                              width={1024}
                              height={400}
                            />
                          )
                        }

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button onClick={handleButtonClick} type="button" variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                              <Camera className="h-4 w-4 mr-2" />
                              Upload Cover
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>• JPG, PNG or GIF</p>
                        <p>• Maximum file size: 5MB</p>
                        <p>• Recommended dimensions: 1200x300px</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-2 mt-4">
                    <Avatar className="h-20 w-20">
                      <Image width={80} height={80} src={selectAvatar || "/placeholder.svg"} alt="Profile" />
                    </Avatar>
                    <div className="space-y-2">
                      <ImageUpload
                        onImageSelect={handleImageSelect}
                      />
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max size.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Abdullah Muhammad" {...register("fullName")} error={errors.fullName?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="abdullah_m" {...register("username")} error={errors.username?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="abdullah@example.com" {...register("email")} error={errors.email?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Kuala Lumpur, Malaysia" {...register("location")} error={errors.location?.message} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Software Engineer | Muslim | Sharing knowledge and inspiration | Interested in tech, Islamic history, and photography"
                        rows={3}
                        {...register("bio")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://abdullah.dev" {...register("website")} error={errors.website?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field: { onChange, value } }) => (
                          <Select onValueChange={onChange} value={value}>
                            <SelectTrigger id="gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />

                    </div>
                  </div>

                  <Button type="submit" disabled={isPending} className="mt-4">
                    {isPending ? "loading..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
    </>
  );
}

export default AccountForm;
