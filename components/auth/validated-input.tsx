"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  error?: string;
  showValidation?: boolean;
}

export function ValidatedInput({
  className,
  isValid,
  error,
  showValidation = false,
  ...props
}: ValidatedInputProps) {
  const showSuccess = showValidation && isValid && !error;
  const showError = showValidation && error;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          {...props}
          className={cn(
            "pr-10",
            showSuccess && "border-green-500/50 focus-visible:ring-green-500",
            showError && "border-red-500/50 focus-visible:ring-red-500",
            className
          )}
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />
        {showSuccess && (
          <div className="absolute right-0 top-0 flex h-full items-center pr-3">
            <Check className="size-4 text-green-400" aria-label="Valid input" />
          </div>
        )}
        {showError && (
          <div className="absolute right-0 top-0 flex h-full items-center pr-3">
            <AlertCircle className="size-4 text-red-400" aria-label="Invalid input" />
          </div>
        )}
      </div>
      {showError && (
        <p
          id={`${props.id}-error`}
          className="text-xs text-red-400 flex items-center gap-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
