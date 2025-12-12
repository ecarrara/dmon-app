"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

export function PasswordInput({
  className,
  showStrength = false,
  value,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strength = showStrength && value ? getPasswordStrength(value as string) : 0;
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          value={value}
          className={cn(
            "pr-10",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-0 flex h-full items-center pr-3 text-slate-400 hover:text-white transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      {showStrength && value && (value as string).length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i < strength ? strengthColors[strength - 1] : "bg-white/10"
                )}
              />
            ))}
          </div>
          {strength > 0 && (
            <p className="text-xs text-slate-400">
              Password strength: <span className={cn("font-medium", strength >= 3 ? "text-green-400" : "text-orange-400")}>
                {strengthLabels[strength - 1]}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
