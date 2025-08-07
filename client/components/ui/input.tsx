"use client";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = {
  error?: string;
  classNameRoot?: string;
} & React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, classNameRoot, error, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className={cn("relative w-full", classNameRoot)}>

        <div className="flex items-center justify-between">
          <input
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error && "border-red-500 focus-visible:ring-red-500/50",
              className,
            )}
            ref={ref}
            aria-invalid={!!error}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className={cn("absolute right-4")}
              tabIndex={-1}
            >
              {showPassword
                ? (
                    <EyeOff className="h-4 w-4" />
                  )
                : (
                    <Eye className="h-4 w-4" />
                  )}
            </button>
          )}
        </div>

        {
          error && <p className="text-red-500 text-sm mt-2">{error}</p>
        }
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
