import React, { FC, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, ImageIcon, Paperclip, Smile, Mic, MicOff, Circle, X } from "lucide-react"
import SocketEventEnum from "@/constants/socket-event"
import { formatTime } from "@/lib/utils"
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes"
import { useSocketStore } from '@/hooks/use-socket'
import { useAuthStore } from '@/store/store'
import { ALLOWED_TYPES, MAX_FILE_SIZE } from '@/constants'
import { UseMutateFunction, useMutation } from '@tanstack/react-query'

interface MessageFormProps {
    handleSendMessage: (e: React.FormEvent) => void
    showEmojiPicker: boolean
    setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>
    emojiPickerRef: React.RefObject<HTMLDivElement | null>
    setMessage: React.Dispatch<React.SetStateAction<string>>
    message: string
    recording: boolean
    recordingTime: number,
    selectedConversation: MessageSender | null
    isPending: boolean
    sendLoading: boolean
    stopRecording: () => void
    startRecording: () => Promise<void>
    sendAudioFun: UseMutateFunction<any, Error, FormData, unknown>

}


const MessageForm: FC<MessageFormProps> = ({
    handleSendMessage,
    showEmojiPicker,
    emojiPickerRef,
    setMessage,
    setShowEmojiPicker,
    recording,
    recordingTime,
    message,
    selectedConversation,
    isPending,
    sendLoading,
    stopRecording,
    startRecording,
    sendAudioFun
}) => {

    const { theme } = useTheme()
    const { socket } = useSocketStore()
    const { user } = useAuthStore()
    const { isPending: isSending } = useMutation({})
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter(file => {
                const isValidType = ALLOWED_TYPES.includes(file.type);
                const isValidSize = file.size <= MAX_FILE_SIZE;

                if (!isValidType) {
                    alert(`Invalid file type: ${file.type}. Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed.`);
                }

                if (!isValidSize) {
                    alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                }

                return isValidType && isValidSize;
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || sendLoading) return;
         const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append("media", file); 
        }
        formData.append("conversationId", String(selectedConversation?.conversationId));
        sendAudioFun(formData)
    };




    return (
        <div className='p-4 border-t border-border'>
            {selectedFiles.length > 0 && (
                <div className="flex gap-2 p-2 rounded-lg">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded-md"
                                />
                            ) : (
                                <video className="h-16 w-16 object-cover rounded-md">
                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                </video>
                            )}
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                            >
                                <X className="h-3 w-3 text-white" />
                            </button>
                            <div className="text-xs mt-1 truncate w-16">{file.name}</div>
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex relative items-center gap-2">
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-14 left-2 z-10">
                        <Picker
                            data={emojiData}
                            onEmojiSelect={(emoji: EmojiPicker) => setMessage(prev => prev + emoji.native)}
                            theme={theme}
                            previewPosition="none"
                            searchPosition="none"
                        />
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
                    multiple
                    className="hidden"
                />
                <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} type="button" variant="ghost" size="icon" className="shrink-0">
                    <Smile className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="ghost" size="icon" className="shrink-0">
                    <ImageIcon className="h-5 w-5" />
                </Button>
                {recording ? (
                    <div className="flex items-center gap-2 flex-1 px-4 py-2 bg-red-50 rounded-full">
                        <Circle className="h-3 w-3 fill-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-500">
                            Recording: {formatTime(recordingTime)}
                        </span>
                    </div>
                ) : (
                    <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            if (selectedConversation?.conversationId) {
                                socket?.emit(SocketEventEnum.TYPING, {
                                    conversationId: selectedConversation.conversationId,
                                    userId: user?.id
                                });
                            }
                        }}
                        className="flex-1"
                    />
                )}
                {(message.trim() || selectedFiles.length > 0) ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || sendLoading || isSending}
                        type="submit"
                        size="icon"
                        className="shrink-0"
                    >
                        {isSending ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    recording ? <Button onClick={stopRecording} type="button" variant="ghost" size="icon" className="shrink-0">
                        <MicOff className="h-5 w-5" />
                    </Button> : <Button onClick={startRecording} type="button" variant="ghost" size="icon" className="shrink-0">
                        <Mic className="h-5 w-5" />
                    </Button>
                )}
            </form>
        </div>
    )
}

export default MessageForm