"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/lib/hooks/use-auth";

const SignInPage = () => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your Shelvitas account
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
          autoComplete="current-password"
          minLength={8}
          className="border-secondary bg-secondary/50"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Forgot your password?
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-shelvitas-green hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
