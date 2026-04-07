"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/lib/hooks/use-auth";

const SignUpPage = () => {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-shelvitas-green/10">
          <Mail className="h-6 w-6 text-shelvitas-green" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Click the link to verify your account, then set up your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your reading journey
        </p>
      </div>

      <OAuthButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-secondary" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="border-secondary bg-secondary/50"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          className="border-secondary bg-secondary/50"
        />
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          className="border-secondary bg-secondary/50"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full gap-2 bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          disabled={isLoading}
        >
          {isLoading ? <><Spinner /> Creating account...</> : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-shelvitas-green hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
