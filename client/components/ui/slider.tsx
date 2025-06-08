"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  orientation?: "horizontal" | "vertical"
  trackClassName?: string
  rangeClassName?: string
  thumbClassName?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      thumbClassName,
      trackClassName,
      rangeClassName,
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === "vertical"

    return (
      <SliderPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={cn(
          "relative flex touch-none select-none",
          isVertical ? "h-full flex-col items-center" : "w-full items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative overflow-hidden bg-secondary rounded-full",
            isVertical ? "w-2 h-full" : "h-2 w-full",
            trackClassName
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              "absolute bg-primary dark:bg-white",
              isVertical ? "w-full" : "h-full",
              rangeClassName
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            thumbClassName
          )}
        />
      </SliderPrimitive.Root>
    )
  }
)

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
