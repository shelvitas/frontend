"use client";

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

export const Navbar = () => {
  const session = useAuthStore((s) => s.session);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-shelves-header/95 backdrop-blur supports-[backdrop-filter]:bg-shelves-header/80">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Shelves" width={28} height={28} />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Shelves
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
              <Button size="sm" variant="ghost" className="text-sm">
                Profile
              </Button>
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
                  className="bg-shelves-green text-sm font-semibold text-shelves-body hover:bg-shelves-green/90"
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
