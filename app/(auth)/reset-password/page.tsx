"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";

const ResetPasswordPage = () => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      await updatePassword(password);
      window.location.href = "/profile";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          className="border-secondary bg-secondary/50"
        />
        <Input
          type="password"
          placeholder="Confirm new password"
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
          {isLoading ? <><Spinner /> Updating...</> : "Update password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
