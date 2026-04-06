"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Users, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/diary", label: "Library", icon: Library },
  { href: "/members", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const pathname = usePathname();
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
    <>
      {/* ── Desktop Header ── */}
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        }`}
      >
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <Image src="/logo.svg" alt="Shelvitas" width={28} height={28} />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Shelvitas
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side — auth */}
          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/profile">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    width={32}
                    height={32}
                    className="hidden rounded-full transition-opacity hover:opacity-80 md:block"
                  />
                ) : (
                  <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold md:flex">
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

      {/* ── Mobile Bottom Nav ── */}
      {session && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-secondary bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                    isActive
                      ? "text-shelvitas-green"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
