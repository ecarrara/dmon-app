import { Eye, EyeOff } from "lucide-react";

interface AIStatusBadgeProps {
  isActive: boolean;
}

export function AIStatusBadge({ isActive }: AIStatusBadgeProps) {
  return (
    <div
      className={`flex h-9 w-fit shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-2 pr-3 shadow-lg backdrop-blur-sm ${
        isActive
          ? "border-emerald-500/30 bg-emerald-500/20"
          : "border-red-500/30 bg-red-500/20"
      }`}
    >
      {isActive ? (
        <Eye className="size-4 text-emerald-400" />
      ) : (
        <EyeOff className="size-4 text-red-400" />
      )}
      <p
        className={`text-xs font-medium leading-normal ${
          isActive ? "text-emerald-100" : "text-red-100"
        }`}
      >
        {isActive ? "AI Active" : "AI Offline"}
      </p>
    </div>
  );
}
