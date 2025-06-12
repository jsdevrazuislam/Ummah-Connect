"use client"
import { AlertCircle, Wifi, RefreshCw, Server, Clock, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type ErrorType = "network" | "server" | "timeout" | "notFound" | "forbidden" | "general"

interface ErrorMessageProps {
    type?: ErrorType
    title?: string
    message?: string
    actionLabel?: string
    onAction?: () => void
    onRetry?: () => void
    className?: string
    showRetry?: boolean
    showHelp?: boolean
}

export function ErrorMessage({
    type = "general",
    title,
    message,
    actionLabel,
    onAction,
    onRetry,
    className = "",
    showRetry = true,
    showHelp = true,
}: ErrorMessageProps) {
    const errorDefaults = {
        network: {
            icon: Wifi,
            title: "Connection Error",
            message: "Please check your internet connection and try again.",
            color: "text-orange-500 dark:text-orange-400",
        },
        server: {
            icon: Server,
            title: "Server Error",
            message: "Our servers are experiencing some issues. We're working to fix it.",
            color: "text-red-500 dark:text-red-400",
        },
        timeout: {
            icon: Clock,
            title: "Request Timeout",
            message: "The request took too long to complete. Please try again.",
            color: "text-amber-500 dark:text-amber-400",
        },
        notFound: {
            icon: AlertCircle,
            title: "Content Not Found",
            message: "The content you're looking for doesn't exist or has been moved.",
            color: "text-blue-500 dark:text-blue-400",
        },
        forbidden: {
            icon: AlertCircle,
            title: "Access Denied",
            message: "You don't have permission to access this content.",
            color: "text-purple-500 dark:text-purple-400",
        },
        general: {
            icon: AlertCircle,
            title: "Something Went Wrong",
            message: "An unexpected error occurred. Please try again later.",
            color: "text-gray-500 dark:text-gray-400",
        },
    }

    const errorInfo = errorDefaults[type]
    const ErrorIcon = errorInfo.icon

    return (
        <Card
            className={`overflow-hidden border-l-4 ${className}`}
            style={{ borderLeftColor: `var(--${errorInfo.color.split("-")[1]}-500)` }}
        >
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                    <div
                        className={`mb-4 rounded-full p-3 ${errorInfo.color.replace("text", "bg")} bg-opacity-10 sm:mb-0 sm:mr-4`}
                    >
                        <ErrorIcon className={`h-6 w-6 ${errorInfo.color}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="mb-1 text-lg font-medium">{title || errorInfo.title}</h3>
                        <p className="text-sm text-muted-foreground">{message || errorInfo.message}</p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            {showRetry && (
                                <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retry
                                </Button>
                            )}

                            {actionLabel && onAction && (
                                <Button variant="default" size="sm" onClick={onAction}>
                                    {actionLabel}
                                </Button>
                            )}

                            {showHelp && (
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Get Help
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
