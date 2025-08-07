import { Globe, Lock, User, Users } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type VisibilityType = "public" | "friends" | "private" | "only_me";

type PostVisibilityBadgeProps = {
  visibility: VisibilityType;
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function PostVisibilityBadge({ visibility, showLabel = false, size = "sm" }: PostVisibilityBadgeProps) {
  const getVisibilityDetails = () => {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          label: "Public",
          description: "Anyone can see this post",
        };
      case "friends":
        return {
          icon: <Users className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          label: "Friends",
          description: "Only your friends can see this post",
        };
      case "private":
        return {
          icon: <Lock className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          label: "Private",
          description: "Only you and mentioned users can see this post",
        };
      case "only_me":
        return {
          icon: <User className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          label: "Only me",
          description: "Only you can see this post",
        };
      default:
        return {
          icon: <Globe className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          label: "Public",
          description: "Anyone can see this post",
        };
    }
  };

  const { icon, label, description } = getVisibilityDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1">
            {icon}
            {showLabel && <span className="text-xs">{label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
