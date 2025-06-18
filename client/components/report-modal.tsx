"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (description: string, images: File[]) => void
    isLoading?: boolean
}

export function ReportModal({ isOpen, onClose, onSubmit, isLoading }: ReportModalProps) {
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);

        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (images.length + newFiles.length > 3) {
                setError("You can upload a maximum of 3 images");
                return;
            }

            const validFiles = newFiles.filter(file => {
                if (file.size > 2 * 1024 * 1024) {
                    setError(`Image ${file.name} is too large (max 2MB)`);
                    return false;
                }

                if (!file.type.startsWith('image/')) {
                    setError(`File ${file.name} is not an image`);
                    return false;
                }

                return true;
            });

            setImages((prev) => [...prev, ...validFiles].slice(0, 3));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError("Please describe the issue");
            return;
        }
        await onSubmit(description, images);
        setDescription("");
        setImages([]);

    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">Report Content</DialogTitle>
                    <DialogDescription>
                        Help us understand the problem. Your report is anonymous.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">Reason for reporting</Label>
                        <Textarea
                            id="description"
                            placeholder="Please describe the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Add images (optional, max 3, 2MB each)</Label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="h-24 w-24 object-cover rounded-md border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {images.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-24 w-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    disabled={isLoading}
                                >
                                    <ImagePlus className="h-6 w-6 mb-1" />
                                    <span className="text-xs">Add Image</span>
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={isLoading || images.length >= 3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!description.trim() || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Report"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}