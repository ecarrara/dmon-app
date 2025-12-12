"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserPlus, Loader2, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp, signIn } from "@/lib/auth-client";
import { AuthLogo } from "@/components/auth/auth-logo";
import { PasswordInput } from "@/components/auth/password-input";
import { ValidatedInput } from "@/components/auth/validated-input";
import { TrustBadge } from "@/components/auth/trust-badge";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (error) {
      setError(error.message || "Failed to sign up");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Logo & Branding */}
      <AuthLogo className="mb-2" />

      {/* Social Proof */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-(--surface-dark)/50 border border-white/5 px-4 py-2">
          <div className="flex -space-x-2">
            <div className="size-6 rounded-full bg-linear-to-br from-blue-400 to-blue-600 ring-2 ring-(--background-dark)" />
            <div className="size-6 rounded-full bg-linear-to-br from-purple-400 to-purple-600 ring-2 ring-(--background-dark)" />
            <div className="size-6 rounded-full bg-linear-to-br from-green-400 to-green-600 ring-2 ring-(--background-dark)" />
          </div>
          <span className="text-xs text-slate-400">
            Join <span className="font-semibold text-white">10,000+</span> safer drivers
          </span>
        </div>
      </div>

      {/* Benefits Preview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-lg bg-(--surface-dark)/50 border border-white/5 p-3 text-center">
          <CheckCircle className="size-5 text-(--primary-blue)" />
          <span className="text-xs text-slate-400">AI Safety</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-lg bg-(--surface-dark)/50 border border-white/5 p-3 text-center">
          <CheckCircle className="size-5 text-(--primary-blue)" />
          <span className="text-xs text-slate-400">Real-time Alerts</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-lg bg-(--surface-dark)/50 border border-white/5 p-3 text-center">
          <CheckCircle className="size-5 text-(--primary-blue)" />
          <span className="text-xs text-slate-400">Trip Analytics</span>
        </div>
      </div>

      {/* Signup Form */}
      <div className="flex flex-col overflow-hidden rounded-xl bg-(--surface-dark) shadow-lg border border-white/5">
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Start your journey to safer driving
          </p>
        </div>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400 flex items-start gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="name" className="text-slate-300 font-medium">
                  Full Name
                </FieldLabel>
                <ValidatedInput
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  disabled={loading}
                  className="h-12 bg-(--surface-highlight) border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-(--primary-blue) focus-visible:border-(--primary-blue)/50"
                  isValid={isNameValid}
                  error={
                    touched.name && !isNameValid
                      ? "Please enter your full name"
                      : ""
                  }
                  showValidation={touched.name && name.length > 0}
                  autoComplete="name"
                  aria-label="Full name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-300 font-medium">
                  Email Address
                </FieldLabel>
                <ValidatedInput
                  id="email"
                  type="email"
                  placeholder="driver@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  disabled={loading}
                  className="h-12 bg-(--surface-highlight) border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-(--primary-blue) focus-visible:border-(--primary-blue)/50"
                  isValid={isEmailValid}
                  error={
                    touched.email && !isEmailValid
                      ? "Please enter a valid email address"
                      : ""
                  }
                  showValidation={touched.email && email.length > 0}
                  autoComplete="email"
                  aria-label="Email address"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-slate-300 font-medium">
                  Password
                </FieldLabel>
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  disabled={loading}
                  className="h-12 bg-(--surface-highlight) border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-(--primary-blue) focus-visible:border-(--primary-blue)/50"
                  placeholder="Create a strong password"
                  showStrength
                  autoComplete="new-password"
                  aria-label="Password"
                />
                {touched.password && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className={cn(
                          "size-1.5 rounded-full",
                          password.length >= 8 ? "bg-green-400" : "bg-slate-600"
                        )}
                      />
                      <span
                        className={cn(
                          password.length >= 8 ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className={cn(
                          "size-1.5 rounded-full",
                          hasNumber ? "bg-green-400" : "bg-slate-600"
                        )}
                      />
                      <span
                        className={cn(
                          hasNumber ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        Contains a number
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div
                        className={cn(
                          "size-1.5 rounded-full",
                          hasSpecialChar ? "bg-green-400" : "bg-slate-600"
                        )}
                      />
                      <span
                        className={cn(
                          hasSpecialChar ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        Contains a special character
                      </span>
                    </div>
                  </div>
                )}
              </Field>

              {/* Terms Acceptance */}
              <div className="flex items-start gap-2 -mt-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 size-4 rounded border-white/10 bg-(--surface-highlight) text-(--primary-blue) focus:ring-(--primary-blue) focus:ring-offset-(--surface-dark)"
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-(--primary-blue) hover:text-blue-400 underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-(--primary-blue) hover:text-blue-400 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Field>
                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={
                    loading || !isNameValid || !isEmailValid || !isPasswordValid
                  }
                  className="group relative w-full overflow-hidden rounded-xl bg-(--primary-blue) text-white shadow-[0_0_20px_rgba(19,91,236,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] min-h-[48px]"
                  aria-label={loading ? "Creating account" : "Create your account"}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-(--primary-blue) via-blue-500 to-(--primary-blue) opacity-100 transition-opacity group-hover:opacity-90" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="absolute h-full w-[200%] translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <div className="relative flex h-12 items-center justify-center gap-2 px-4">
                    {loading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <UserPlus className="size-5" />
                    )}
                    <span className="font-semibold text-base">
                      {loading ? "Creating account..." : "Create account"}
                    </span>
                  </div>
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-(--surface-dark) px-2 text-slate-500">
                      Or sign up with
                    </span>
                  </div>
                </div>

                {/* Secondary CTA - Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full h-12 min-h-[48px] rounded-lg bg-(--surface-highlight) border border-white/10 text-white text-sm font-medium hover:bg-(--surface-highlight)/80 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                  aria-label="Sign up with Google"
                >
                  <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <FieldDescription className="text-center text-slate-400 mt-4">
                  Already have an account?{" "}
                  <a
                    href="/sign-in"
                    className="text-(--primary-blue) hover:text-blue-400 transition-colors underline underline-offset-4 font-medium focus:outline-none focus:ring-2 focus:ring-(--primary-blue) focus:ring-offset-2 focus:ring-offset-(--surface-dark) rounded px-1"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>

      {/* Trust Signals */}
      <TrustBadge />

      {/* Value Props */}
      <div className="rounded-lg bg-(--surface-dark)/30 border border-white/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-(--primary-blue) mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Free to get started
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              No credit card required. Start monitoring your drives instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
