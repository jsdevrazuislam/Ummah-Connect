"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Type, Upload, Palette, Share2, ImageIcon, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { create_story } from "@/lib/apis/posts"
import { toast } from "sonner"
import Image from "next/image"
import { useStore } from "@/store/store"

type StoryMode = "select" | "photo" | "text"

const textBackgrounds = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
]

const textColors = ["#ffffff", "#000000", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"]

export default function StoryCreator() {
    const { addStory } = useStore()
    const [mode, setMode] = useState<StoryMode>("select")
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
    const [photoText, setPhotoText] = useState("")
    const [photoTextColor, setPhotoTextColor] = useState("#ffffff")
    const [textStory, setTextStory] = useState("")
    const [selectedBackground, setSelectedBackground] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
    const [textColor, setTextColor] = useState("#ffffff")
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationFn: create_story,
        onSuccess: (data) => {
            addStory(data?.data)
            router.push('/')
        },
        onError: (error) => [
            toast.error(error.message)
        ]
    })

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const resetToSelect = () => {
        setMode("select")
        setSelectedFile(undefined)
        setPhotoText("")
        setTextStory("")
    }

    const shareStory = () => {
        const formData = new FormData()
        if(selectedFile) formData.append('media', selectedFile)
        formData.append('caption', selectedFile ? photoText: textStory)
        formData.append('type', selectedFile ? "image": "text")
        formData.append('background', selectedBackground)
        formData.append('textColor', selectedFile ? photoTextColor : textColor)
        mutate(formData)
    }

    return (
        <div className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="p-2 rounded-xl cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500">
                        <X className="h-5 w-5 text-white" />
                    </button>
                    {mode !== "select" && (
                        <Button variant="ghost" size="sm" onClick={resetToSelect} className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                {mode === "select" && (
                    <div className="w-full max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                Create Your Story
                            </h2>
                            <p className="text-muted-foreground text-xl">Choose your creative journey</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            <Card
                                className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm"
                                onClick={() => setMode("photo")}
                            >
                                <div className="h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <Camera className="h-16 w-16" />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-3">Photo Story</h3>
                                        <p className="text-center text-white/90 text-lg">Transform your photos into captivating stories</p>
                                    </CardContent>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2">
                                        <ImageIcon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </Card>

                            <Card
                                className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-blue-500/10 to-green-500/10 backdrop-blur-sm"
                                onClick={() => setMode("text")}
                            >
                                <div className="h-80 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <CardContent className="relative h-full flex flex-col items-center justify-center text-white p-8">
                                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <Type className="h-16 w-16" />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-3">Text Story</h3>
                                        <p className="text-center text-white/90 text-lg">
                                            Craft beautiful stories with stunning backgrounds
                                        </p>
                                    </CardContent>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2">
                                        <Type className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {mode === "photo" && (
                    <div className="w-full h-full max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8 h-full">
                            <div className="flex flex-col space-y-6 overflow-y-auto pr-2">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Photo Story
                                    </h2>
                                    <p className="text-muted-foreground">Upload your image and add beautiful text</p>
                                </div>

                                {!selectedFile ? (
                                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                                        <CardContent className="p-12">
                                            <div className="text-center">
                                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 w-fit mx-auto mb-6">
                                                    <Upload className="h-12 w-12 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-semibold mb-3">Upload Your Photo</h3>
                                                <p className="text-muted-foreground mb-6">Choose an image to start creating</p>
                                                <Label htmlFor="image-upload" className="bg-gradient-to-r px-7 rounded-md cursor-pointer py-3 from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                                    Select Image
                                                </Label>
                                                <Input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-6 flex-1">
                                        <Card className="bg-gradient-to-br from-background to-muted/20 border-0 shadow-none">
                                            <CardContent className="p-6">
                                                <Label htmlFor="photo-text" className="text-lg font-semibold mb-4 block">
                                                    Story Text
                                                </Label>
                                                <Textarea
                                                    id="photo-text"
                                                    placeholder="Write your story here..."
                                                    value={photoText}
                                                    onChange={(e) => setPhotoText(e.target.value)}
                                                    className="min-h-[120px] text-lg border-0 bg-background/50 backdrop-blur-sm"
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-gradient-to-br from-background to-muted/20 border-0 shadow-none">
                                            <CardContent className="p-6">
                                                <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    <Palette className="h-5 w-5" />
                                                    Text Color
                                                </Label>
                                                <div className="grid grid-cols-8 gap-3">
                                                    {textColors.map((color, index) => (
                                                        <button
                                                            key={index}
                                                            className={cn(
                                                                "w-10 h-10 cursor-pointer rounded-xl border-3 transition-all duration-300 hover:scale-110",
                                                                photoTextColor === color
                                                                    ? "border-primary scale-110 shadow-lg"
                                                                    : "border-muted-foreground/20",
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setPhotoTextColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Label htmlFor="image-upload" className="w-full cursor-pointer bg-background/50 backdrop-blur-sm border-0 hover:bg-background/80">
                                            Change Image
                                        </Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-semibold">Live Preview</h3>
                                    <p className="text-muted-foreground">See how your story will look</p>
                                </div>
                                <Card className="flex-1 overflow-hidden border-0 shadow-none">
                                    <div className="relative h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                                        {selectedFile ? (
                                            <>
                                                <Image
                                                    src={URL.createObjectURL(selectedFile)}
                                                    alt="Story preview"
                                                    className="w-full h-full object-cover"
                                                    width={200}
                                                    height={150}
                                                />
                                                {photoText && (
                                                    <div className="absolute inset-0 flex items-center justify-center p-8">
                                                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 max-w-full border border-white/20">
                                                            <p
                                                                className="text-center text-2xl font-semibold break-words leading-relaxed"
                                                                style={{ color: photoTextColor }}
                                                            >
                                                                {photoText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 mb-4 w-fit mx-auto">
                                                    <Camera className="h-20 w-20" />
                                                </div>
                                                <p className="text-xl">Your photo story will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {mode === "text" && (
                    <div className="w-full h-full max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8 h-full">
                            <div className="flex flex-col space-y-6 overflow-y-auto pr-2">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                        Text Story
                                    </h2>
                                    <p className="text-muted-foreground">Create beautiful text stories with stunning backgrounds</p>
                                </div>

                                <Card className="shadow-none">
                                    <CardContent className="p-6">
                                        <Label htmlFor="text-story" className="text-lg font-semibold mb-4 block">
                                            Your Story
                                        </Label>
                                        <Textarea
                                            id="text-story"
                                            placeholder="Tell your story here..."
                                            value={textStory}
                                            onChange={(e) => setTextStory(e.target.value)}
                                            className="min-h-[180px] text-lg border-0 bg-background/50 backdrop-blur-sm"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none">
                                    <CardContent className="p-6">
                                        <Label className="text-lg font-semibold mb-4 block">Background Style</Label>
                                        <div className="grid grid-cols-8 gap-3">
                                            {textBackgrounds.map((bg) => (
                                                <button
                                                    key={bg}
                                                    className={cn(
                                                        "aspect-square cursor-pointer rounded-xl border-3 transition-all duration-300 hover:scale-105",
                                                        selectedBackground === bg
                                                            ? "border-primary scale-105 shadow-lg"
                                                            : "border-muted-foreground/20",
                                                    )}
                                                    style={{ background: bg }}
                                                    onClick={() => setSelectedBackground(bg)}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-background to-muted/20 border-0 shadow-none">
                                    <CardContent className="p-6">
                                        <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Palette className="h-5 w-5" />
                                            Text Color
                                        </Label>
                                        <div className="grid grid-cols-8 gap-3">
                                            {textColors.map((color, index) => (
                                                <button
                                                    key={index}
                                                    className={cn(
                                                        "w-10 h-10 cursor-pointer rounded-xl border-3 transition-all duration-300 hover:scale-110",
                                                        textColor === color ? "border-primary scale-110 shadow-none" : "border-muted-foreground/20",
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setTextColor(color)}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-semibold">Live Preview</h3>
                                    <p className="text-muted-foreground">See how your story will look</p>
                                </div>
                                <Card className="flex-1 overflow-hidden border-0 shadow-none">
                                    <div
                                        className="h-full flex items-center justify-center p-8"
                                        style={{ background: selectedBackground }}
                                    >
                                        {textStory ? (
                                            <p
                                                className="text-center text-3xl font-bold leading-relaxed break-words max-w-full"
                                                style={{ color: textColor }}
                                            >
                                                {textStory}
                                            </p>
                                        ) : (
                                            <div className="text-center text-white/70">
                                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 mb-4 w-fit mx-auto">
                                                    <Type className="h-20 w-20" />
                                                </div>
                                                <p className="text-xl">Your text story will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {mode !== "select" && (
                <div className="px-6 py-3 border-t border-border/50 bg-background/80 backdrop-blur-xl">
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="px-12 py-3 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={(mode === "photo" ? !selectedFile : !textStory) || isPending}
                            onClick={shareStory}
                        >
                            <Share2 className="h-5 w-5 mr-3" />
                            { isPending ? 'Create Story...' : 'Share Story'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}