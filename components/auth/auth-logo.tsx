import { Shield, Eye } from "lucide-react";

interface AuthLogoProps {
  className?: string;
}

export function AuthLogo({ className }: AuthLogoProps) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        {/* Logo Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-(--primary-blue)/20 blur-xl" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-(--primary-blue) to-blue-600 shadow-lg shadow-(--primary-blue)/50">
            <div className="relative">
              <Shield className="size-8 text-white" strokeWidth={2.5} />
              <Eye className="absolute -right-1 -top-1 size-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* App Name & Tagline */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            DriverMon
          </h1>
          <p className="text-sm text-slate-400">
            Drive Safer, Track Smarter
          </p>
        </div>
      </div>
    </div>
  );
}
