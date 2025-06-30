import { cn } from "@/lib/utils";
import { Merge } from "lucide-react";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold text-primary",
        className,
      )}
    >
      <Merge />
      closelead
    </div>
  );
};
