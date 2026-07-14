"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useLocale } from "@/components/locale-provider";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Heart, MessageSquare, UserPlus, Trophy, Star } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  target_type: string | null;
  target_id: string | null;
  read: boolean;
  created_at: string;
}

const ICONS: Record<string, React.ReactNode> = {
  new_follower: <UserPlus className="h-4 w-4 text-ember" />,
  new_comment: <MessageSquare className="h-4 w-4 text-blue-400" />,
  new_like: <Heart className="h-4 w-4 text-red-400" />,
  achievement_earned: <Trophy className="h-4 w-4 text-amber-400" />,
  tool_featured: <Star className="h-4 w-4 text-yellow-400" />,
  challenge_invite: <Trophy className="h-4 w-4 text-emerald-400" />,
};

export function NotificationBell() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getUnreadNotificationCount(user.id).then(setUnreadCount).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !isOpen) return;
    getNotifications(user.id).then(setNotifications).catch(() => {});
  }, [user, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-parchment hover:text-ember"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={locale === "es" ? "Notificaciones" : "Notifications"}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-ember text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-medium text-parchment text-sm">
              {locale === "es" ? "Notificaciones" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-ash hover:text-ember transition-colors flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {locale === "es" ? "Marcar todo leído" : "Mark all read"}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-ash">
                <Bell className="h-8 w-8 mx-auto mb-2 text-ash/50" />
                <p className="text-sm">{locale === "es" ? "No tienes notificaciones" : "No notifications yet"}</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 border-b border-border/50 transition-colors ${
                    n.read ? "bg-transparent" : "bg-ember/5"
                  }`}
                >
                  <div className="mt-0.5">
                    {ICONS[n.type] || <Bell className="h-4 w-4 text-ash" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-ash" : "text-parchment"}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-xs text-ash mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-xs text-ash/50 mt-1">
                      {new Date(n.created_at).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-ash hover:text-ember transition-colors mt-0.5"
                      title={locale === "es" ? "Marcar como leído" : "Mark as read"}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-2 border-t border-border text-center">
              <button className="text-xs text-ember hover:underline">
                {locale === "es" ? "Ver todas" : "View all"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
