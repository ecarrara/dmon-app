import { Eye } from "lucide-react";

interface AIStatusBadgeProps {
  isActive: boolean;
}

export function AIStatusBadge({ isActive }: AIStatusBadgeProps) {
  if (!isActive) return null;

  return (
    <div className="flex h-9 w-fit shrink-0 items-center justify-center gap-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 pl-2 pr-3 shadow-lg backdrop-blur-sm">
      <Eye className="size-4 text-emerald-400" />
      <p className="text-xs font-medium leading-normal text-emerald-100">
        AI Active
      </p>
    </div>
  );
}
