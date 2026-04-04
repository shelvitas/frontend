"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";

const CompleteProfilePage = () => {
  const { registerProfile, user } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerProfile(username, displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Set up your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a username and display name to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="username"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="e.g. booklover42"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
              )
            }
            required
            minLength={3}
            maxLength={30}
            autoComplete="username"
            className="border-secondary bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            Letters, numbers, hyphens, and underscores only
          </p>
        </div>

        <div className="space-y-1.5">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="displayName"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Display name
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={100}
            autoComplete="name"
            className="border-secondary bg-secondary/50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-shelvitas-green font-semibold text-background hover:bg-shelvitas-green/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating profile..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default CompleteProfilePage;
