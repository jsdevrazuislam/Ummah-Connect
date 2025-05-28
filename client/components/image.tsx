"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Image } from 'lucide-react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    skeletonClassName?: string;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
    src,
    alt,
    className,
    skeletonClassName,
    onLoad,
    onError,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        setIsError(false);
        onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoading(false);
        setIsError(true);
        onError?.(event);
    };

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div
                    className={cn(
                        "absolute inset-0 bg-gray-200 animate-pulse rounded flex justify-center items-center",
                        "dark:bg-gray-700",
                        skeletonClassName
                    )}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Image className='w-8 h-8' />
                </div>
            )}

            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={cn(
                        "object-cover transition-opacity duration-300",
                        isLoading ? "opacity-0" : "opacity-100",
                        isError ? "opacity-0" : "",
                        className
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    {...props}
                />
            ) : (
                <div
                    className={cn(
                        "flex items-center justify-center bg-gray-100 text-gray-500 rounded",
                        "dark:bg-gray-800 dark:text-gray-400",
                        className
                    )}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    No Image
                </div>
            )}


            {isError && !isLoading && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 rounded",
                        "dark:bg-gray-800 dark:text-gray-400",
                        className
                    )}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export { ImageWithSkeleton };