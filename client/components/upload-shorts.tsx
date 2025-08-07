"use client";

import type { ChangeEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadShorts } from "@/lib/apis/stream";
import { showError, showSuccess } from "@/lib/toast";
import { addShortVideo } from "@/lib/update-stream-data";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadShortModal() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const resetForm = () => {
    setDescription("");
    if (videoPreview)
      URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: uploadShorts,
    onSuccess: (data) => {
      queryClient.setQueryData(["get_shorts"], (oldData: QueryOldShortsDataPayload) => {
        return addShortVideo(oldData, data?.data);
      });
      showSuccess("Short uploaded successfully!");
      resetForm();
      setOpen(false);
      router.replace(`/shorts/${data?.data?.id}`);
    },
    onError: (error) => {
      showError(error.message || "Failed to upload short");
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > MAX_FILE_SIZE_BYTES) {
        showError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
        return;
      }

      if (!file.type.includes("video")) {
        showError("Please upload a video file");
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveVideo = () => {
    if (videoPreview)
      URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = () => {
    if (!videoFile) {
      showError("Please select a video to upload");
      return;
    }

    const formData = new FormData();
    formData.append("media", videoFile);
    formData.append("description", description);

    mutate(formData);
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="gap-2 z-50 text-white rounded-full w-10 h-10 bg-white/50 absolute right-6 bottom-6">
        <Upload className="h-4 w-4" />
      </Button>
      <LoadingOverlay loading={isPending} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">Upload Short Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-upload" className="mb-3 inline-block">
                Video (max
                {MAX_FILE_SIZE_MB}
                MB)
              </Label>
              {videoPreview
                ? (
                    <div className="relative">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-64 rounded-md bg-black object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveVideo}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                : (
                    <div
                      onClick={handleUploadClick}
                      className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                    >
                      <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload video
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max
                        {" "}
                        {MAX_FILE_SIZE_MB}
                        MB
                      </p>
                    </div>
                  )}
              <input
                ref={fileInputRef}
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="mb-3 inline-block">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isPending || !videoFile}
              >
                {isPending
                  ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )
                  : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
