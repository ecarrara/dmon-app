import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-(--background-dark) text-white">
      {children}
    </div>
  );
}
