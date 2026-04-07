"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, UserPlus, Heart, MessageCircle, Check } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { RemoteImage } from "@/components/ui/remote-image";

interface Notification {
  id: string;
  type: string;
  targetId: string | null;
  targetType: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { username: string; displayName: string; avatarUrl: string | null };
}

const typeIcons: Record<string, typeof Bell> = {
  follow: UserPlus,
  follow_request: UserPlus,
  follow_accepted: UserPlus,
  review_like: Heart,
  review_save: Heart,
  comment: MessageCircle,
  comment_reply: MessageCircle,
  list_like: Heart,
};

const typeLabels: Record<string, string> = {
  follow: "followed you",
  follow_request: "wants to follow you",
  follow_accepted: "accepted your follow request",
  review_like: "liked your review",
  review_save: "saved your review",
  comment: "commented on your review",
  comment_reply: "replied to your comment",
  list_like: "liked your list",
};

const NotificationsPage = () => {
  const session = useAuthStore((s) => s.session);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await api.get<{ notifications: Notification[] }>(
        "/v1/notifications?limit=50",
      );
      setNotifications(data.notifications);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post("/v1/notifications/mark-read", { all: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // handle silently
    } finally {
      setMarkingAll(false);
    }
  };

  if (!session && typeof window !== "undefined") {
    window.location.href = "/sign-in";
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Navbar />
      <main className="container max-w-2xl flex-1 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-shelvitas-green" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-shelvitas-green px-2 py-0.5 text-[10px] font-bold text-background">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={markAllRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {isLoading && <PageLoader />}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center py-20">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Activity from your followers will show up here.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-1">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-sm p-3 ${!n.isRead ? "bg-secondary/30" : ""}`}
              >
                {n.actor.avatarUrl ? (
                  <RemoteImage
                    src={n.actor.avatarUrl}
                    alt={n.actor.displayName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                    {n.actor.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link
                      href={`/${n.actor.username}`}
                      className="font-medium hover:text-shelvitas-green"
                    >
                      {n.actor.displayName}
                    </Link>{" "}
                    <span className="text-muted-foreground">
                      {typeLabels[n.type] ?? n.type}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
