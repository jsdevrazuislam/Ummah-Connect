"use client"
import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react"; 

interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  classNameRoot?:string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, classNameRoot, error, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className={cn("relative w-full", classNameRoot)}>
        <input
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus-visible:ring-red-500/50",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={cn("absolute right-2 -translate-y-1/2 text-muted-foreground focus:outline-none", error ? 'top-[30%]' : 'top-1/2')}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {
          error && <p className="text-red-500 text-sm mt-2">{error}</p>
        }
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };