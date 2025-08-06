import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Badge as BadgeType } from "@/lib/types";

interface AchievementBadgeProps {
  badge: BadgeType;
  unlocked: boolean;
}

export function AchievementBadge({ badge, unlocked }: AchievementBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
            unlocked ? 'opacity-100' : 'opacity-30 grayscale'
          )}>
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center bg-accent/30",
              unlocked && "border-2 border-primary"
            )}>
              <badge.icon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-center font-medium">{badge.name}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
