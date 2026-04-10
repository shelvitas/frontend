"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Settings,
  LogOut,
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  BookOpen,
  CheckCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { RemoteImage } from "@/components/ui/remote-image";

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  targetId: string | null;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  reviewId: string | null;
  shelfId: string | null;
}

interface PendingRequest {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

const notifIcons: Record<string, typeof Bell> = {
  follow: UserPlus,
  follow_request: UserPlus,
  follow_accepted: UserPlus,
  review_like: Heart,
  review_save: BookOpen,
  comment: MessageCircle,
  comment_reply: MessageCircle,
  shelf_like: Heart,
};

const notifMessages: Record<string, string> = {
  follow: "started following you",
  follow_request: "requested to follow you",
  follow_accepted: "accepted your follow request",
  review_like: "liked your review",
  review_save: "saved your review",
  comment: "commented on your review",
  comment_reply: "replied to your comment",
  shelf_like: "liked your shelf",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const NotificationItem = ({
  notif,
  onClose,
  onUpdate,
}: {
  notif: Notification;
  onClose: () => void;
  onUpdate: (n: Notification) => void;
}) => {
  const Icon = notifIcons[notif.type] ?? Bell;
  const message = notifMessages[notif.type] ?? "interacted";
  const [acting, setActing] = useState(false);
  const [resolved, setResolved] = useState<"accepted" | "denied" | null>(null);

  const handleFollowAction = async (action: "approve" | "deny") => {
    if (!notif.actor) return;
    setActing(true);
    try {
      // Find the pending follow request from this actor
      const data = await api.get<PendingRequest[]>(
        "/v1/follow-requests?limit=50",
      );
      const requests = Array.isArray(data) ? data : [];
      const match = requests.find((r) => r.user.id === notif.actor?.id);
      if (!match) {
        setResolved(action === "approve" ? "accepted" : "denied");
        return;
      }
      await api.post(`/v1/follow-requests/${match.id}/${action}`);
      // Mark notification as read in the DB
      await api.post("/v1/notifications/mark-read", {
        notificationIds: [notif.id],
      });
      setResolved(action === "approve" ? "accepted" : "denied");
      onUpdate({ ...notif, isRead: true });
    } catch {
      // silent
    } finally {
      setActing(false);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/20 ${
        !notif.isRead ? "bg-shelvitas-green/[0.03]" : ""
      }`}
    >
      {/* Avatar */}
      {notif.actor?.avatarUrl ? (
        <RemoteImage
          src={notif.actor.avatarUrl}
          alt={notif.actor.displayName}
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full"
        />
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
          {notif.actor?.displayName?.charAt(0).toUpperCase() ?? "?"}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed">
          <Link
            href={`/${notif.actor?.username ?? ""}`}
            className="font-semibold hover:text-shelvitas-green"
            onClick={onClose}
          >
            {notif.actor?.displayName ?? "Someone"}
          </Link>{" "}
          <span className="text-muted-foreground">{message}</span>
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {timeAgo(notif.createdAt)}
        </p>

        {/* Follow request actions */}
        {notif.type === "follow_request" && !resolved && !notif.isRead && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={() => handleFollowAction("approve")}
              className="flex cursor-pointer items-center gap-1 rounded-sm bg-shelvitas-green px-2.5 py-1 text-[10px] font-semibold text-background transition-colors hover:bg-shelvitas-green/90 disabled:opacity-60"
            >
              {acting ? (
                <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-background border-t-transparent" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Accept
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => handleFollowAction("deny")}
              className="flex cursor-pointer items-center gap-1 rounded-sm bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60"
            >
              {acting ? (
                <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-muted-foreground border-t-transparent" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Deny
            </button>
          </div>
        )}
        {notif.type === "follow_request" &&
          (resolved === "accepted" || (notif.isRead && !resolved)) && (
            <p className="mt-1.5 text-[10px] font-medium text-shelvitas-green">
              Follow request accepted
            </p>
          )}
        {notif.type === "follow_request" && resolved === "denied" && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Follow request denied
          </p>
        )}
      </div>

      {/* Type icon */}
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />

      {/* Unread dot */}
      {!notif.isRead && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-shelvitas-green" />
      )}
    </div>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{
        notifications: Notification[];
        nextCursor: string | null;
      }>("/v1/notifications?limit=20");
      setNotifications(data.notifications);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on first open
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Poll for unread count every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.post("/v1/notifications/mark-read", { all: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-secondary/50"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shelvitas-red px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
            aria-label="Close notifications"
          />

          {/* Panel */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-secondary bg-background shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex cursor-pointer items-center gap-1 text-[10px] text-shelvitas-green hover:underline"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-shelvitas-green border-t-transparent" />
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-6 w-6 text-muted-foreground/30" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              )}

              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  onClose={() => setOpen(false)}
                  onUpdate={(updated) =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === updated.id ? updated : n)),
                    )
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const navItems = [
  { href: "/feed", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/diary", label: "Library" },
  { href: "/members", label: "Members" },
  { href: "/profile", label: "Profile" },
];

export const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side — auth (only after mount to avoid hydration mismatch) */}
          <div className="flex items-center gap-3">
            {!mounted && <div className="h-8 w-8" />}

            {/* Notifications bell */}
            {mounted && session && <NotificationBell />}

            {/* Avatar + dropdown */}
            {mounted && session && (
              <div className="group relative hidden md:block">
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
                {/* Dropdown */}
                <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="w-40 rounded-sm border border-secondary bg-background py-1 shadow-lg">
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = "/";
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
            {mounted && !session && (
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
      {mounted && session && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-secondary bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 text-xs font-medium ${
                    isActive ? "text-shelvitas-green" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
