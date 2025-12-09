import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active
          ? "text-(--primary-blue)"
          : "text-slate-400 hover:text-slate-200",
      )}
    >
      <Icon className={cn("size-6", active && "fill-current")} />
      <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>
        {label}
      </span>
    </button>
  );
}
