"use client";

import { Home, FileText, User, Settings } from "lucide-react";
import { NavItem } from "./nav-item";

type NavTab = "home" | "reports" | "profile" | "settings";

interface BottomNavProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "reports" as const, icon: FileText, label: "Reports" },
    { id: "profile" as const, icon: User, label: "Profile" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/5 bg-[var(--surface-dark)]/90 pb-5 pt-3 backdrop-blur-lg">
      <div className="grid w-full grid-cols-4">
        {tabs.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange?.(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
