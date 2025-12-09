import { Bell } from "lucide-react";
import { UserAvatar } from "./user-avatar";

interface HeaderProps {
  userName: string;
  userImage?: string | null;
  greeting?: string;
  role?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Header({ userName, userImage, greeting, role = "Pro Driver" }: HeaderProps) {
  const displayGreeting = greeting || getGreeting();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-[var(--background-dark)]/95 px-4 py-4 pt-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <UserAvatar name={userName} image={userImage} />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">
            {displayGreeting}, {userName}
          </h2>
          <span className="text-xs font-medium text-slate-400">{role}</span>
        </div>
      </div>
      <button className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-dark)]/50 text-slate-400 transition-colors hover:bg-[var(--surface-dark)]">
        <Bell className="size-5" />
      </button>
    </header>
  );
}
