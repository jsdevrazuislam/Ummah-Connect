import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

const LoadingUi = ({ title, className }: { title: string, className?:string}) => {
    return (
        <div className={cn('absolute top-0 left-0 w-full h-full bg-black/50 z-40 flex justify-center items-center', className)}>
            <Loader2 className="animate-spin h-8 w-8" />
            {title}...
        </div>
    )
}

export default LoadingUi