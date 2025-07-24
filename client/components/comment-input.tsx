import { useDebouncedValue } from '@/hooks/use-debounce';
import { create_comment } from '@/lib/apis/comment';
import { user_suggestion } from '@/lib/apis/posts';
import { useStore } from '@/store/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface CommentInputProps{
    post: PostsEntity
}

const CommentInput = ({
    post
}: CommentInputProps) => {

    const [query, setQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [comment, setComment] = useState("")
    const { user } = useStore()
    const highlightMentions = (text: string) => {
        return text.replace(/(@\w+)/g, '<span class="text-blue-500">$1</span>');
    };

    const suggestionsRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebouncedValue(query, 300);
    const { data, isLoading: isUserFetching } = useQuery({
        queryKey: ["mention-users", debouncedQuery],
        queryFn: () => user_suggestion(query),
        enabled: !!debouncedQuery,
    });

    const { mutate: mnFun, isPending: isLoading } = useMutation({
        mutationFn: create_comment,
        onSuccess: () => {
            setComment("")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleAddComment = () => {
        if (comment?.trim()) {
            const payload = {
                content: comment,
                postId: post.id
            }
            mnFun(payload)
        }
    }

    const handleSelect = (username: string) => {
        const updatedText = comment?.replace(/@(\w+)$/, `@${username} `);
        setComment(updatedText);
        setShowSuggestions(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setComment(value);
        const match = value.match(/@(\w+)$/);
        if (match) {
            setQuery(match[1]);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        if (highlightRef.current) {
            highlightRef.current.innerHTML = highlightMentions(comment || " ");
        }
    }, [comment]);

    return (
        <>
            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    {
                        user?.avatar ? <AvatarImage src={user?.avatar} alt="You" /> : <AvatarFallback>
                            {user?.full_name?.charAt(2)}
                        </AvatarFallback>
                    }

                </Avatar>
                <div className="flex-1 flex gap-2 relative" ref={suggestionsRef}>

                    <div
                        ref={highlightRef}
                        className="absolute inset-0 whitespace-pre-wrap break-words text-sm p-2 pointer-events-none text-transparent"
                        aria-hidden="true"
                    />
                    <Input
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={handleChange}
                        className="w-full text-sm p-2 resize-none bg-transparent text-black dark:text-white border rounded-md absolute inset-0 z-10"

                    />

                    <Button
                        size="icon"
                        onClick={handleAddComment}
                        disabled={!comment?.trim() || isLoading}
                        className="absolute z-10 right-0 top-1 h-full aspect-square rounded-l-none"
                    >
                        <Send className="h-4 w-4" />
                    </Button>

                    {showSuggestions && (
                        <div className="absolute bottom-full z-[100] left-0 mb-2 w-full max-w-md bg-background rounded-lg shadow-lg border">
                            {isUserFetching ? (
                                <ul className="max-h-60 overflow-y-auto">
                                    {[...Array(3)].map((_, i) => (
                                        <li key={i} className="px-4 py-3 flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                                <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
                                            </div>
                                            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
                                        </li>
                                    ))}
                                </ul>
                            ) : data?.data && data?.data?.length > 0 ? (
                                <ul className="max-h-60 overflow-y-auto">
                                    {data.data.map((user) => (
                                        <li
                                            key={user.id}
                                            className="cursor-pointer px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors"
                                            onClick={() => handleSelect(user.username)}
                                        >
                                            <div className="flex-shrink-0">
                                                <Avatar className="h-10 w-10">
                                                    {user?.avatar ? (
                                                        <AvatarImage src={user.avatar} alt={user.full_name} />
                                                    ) : (
                                                        <AvatarFallback>
                                                            {user.full_name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{user.full_name}</p>
                                                <p className="text-muted-foreground text-sm truncate flex items-center gap-x-2">
                                                    Profile <div className="w-1 h-1 rounded-full bg-primary" />
                                                    {user.follower_count} followers
                                                </p>
                                            </div>
                                            {user.is_following && (
                                                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                    Following
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-3 text-muted-foreground text-sm">
                                    {query ? `No users found matching "@${query}"` : "Type @ to search users"}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CommentInput