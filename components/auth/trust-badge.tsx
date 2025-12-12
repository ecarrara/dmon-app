import { Lock, Shield } from "lucide-react";

export function TrustBadge() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="size-3.5" />
        <span>Secure Connection</span>
      </div>
      <div className="h-3 w-px bg-white/10" />
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Shield className="size-3.5" />
        <span>Privacy Protected</span>
      </div>
    </div>
  );
}
