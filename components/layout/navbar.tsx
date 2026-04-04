"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
  >
    {children}
  </Link>
);

export const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return undefined;

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  const isTransparent = transparent && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      }`}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1">
            <Image src="/logo.svg" alt="Shelvitas" width={28} height={28} />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Shelvitas
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/lists">Lists</NavLink>
            <NavLink href="/members">Members</NavLink>
            <NavLink href="/journal">Journal</NavLink>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-sm p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {session ? (
            <Link href="/profile">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={32}
                  height={32}
                  className="rounded-full transition-opacity hover:opacity-80"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {profile?.displayName?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-shelvitas-green text-sm font-semibold text-background hover:bg-shelvitas-green/90"
                >
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
