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
    onSubmit: () => void
}

export function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).slice(0, 3);
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit();
        setIsSubmitting(false);
        onClose();
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
                        <Label>Add images (optional)</Label>
                        <div className="flex flex-wrap gap-3">
                            {/* Preview uploaded images */}
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
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!description || isSubmitting}
                    >
                        {isSubmitting ? (
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