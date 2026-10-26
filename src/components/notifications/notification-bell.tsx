
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiX,
} from "react-icons/fi";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  appointmentId: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationBellProps = {
  role?: string | null;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  error?: string;
};

export function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as NotificationsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Could not load notifications.");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch {
      setError("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not update notification.");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                readAt: notification.readAt ?? new Date().toISOString(),
              }
            : notification,
        ),
      );

      await loadNotifications();
    } catch {
      setError("Could not mark notification as read.");
    }
  }

  async function markAllAsRead() {
    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not update notifications.");
      }

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        })),
      );

      setUnreadCount(0);
    } catch {
      setError("Could not mark all notifications as read.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleNotificationClick(
    notification: NotificationItem,
  ) {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }

    setIsOpen(false);

    if (!notification.appointmentId) {
      return;
    }

    if (role === "DOCTOR") {
      router.push("/doctor/appointments");
    } else if (role === "ADMIN") {
      router.push("/admin/appointments");
    } else {
      router.push("/appointments");
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "APPOINTMENT_CONFIRMED":
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;

      case "APPOINTMENT_REJECTED":
      case "APPOINTMENT_CANCELLED":
        return <FiX className="h-5 w-5 text-red-500" />;

      case "APPOINTMENT_REQUESTED":
        return <FiCalendar className="h-5 w-5 text-blue-600" />;

      case "APPOINTMENT_REMINDER":
        return <FiClock className="h-5 w-5 text-amber-600" />;

      default:
        return <FiAlertCircle className="h-5 w-5 text-gray-500" />;
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        onClick={() => {
          const willOpen = !isOpen;
          setIsOpen(willOpen);

          if (willOpen) {
            void loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#D1DCCF] bg-white text-[#166534] transition hover:bg-[#F0F7F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
      >
        <FiBell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <section
            aria-label="Notifications"
            className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#E2E8E3] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8E3] px-4 py-3">
              <div>
                <h2 className="font-semibold text-[#1C2921]">
                  Notifications
                </h2>
                <p className="text-xs text-[#647067]">
                  {unreadCount} unread
                </p>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void markAllAsRead()}
                    className="text-xs font-semibold text-[#166534] hover:underline disabled:opacity-50"
                  >
                    {isUpdating ? "Updating..." : "Mark all read"}
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#647067] hover:bg-[#F0F7F1]"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                {error}
                <button
                  type="button"
                  onClick={() => void loadNotifications()}
                  className="ml-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="mb-2 h-3 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <FiCheck className="mb-2 h-8 w-8 text-[#166534]" />
                  <p className="font-medium text-[#1C2921]">
                    You&apos;re all caught up
                  </p>
                  <p className="mt-1 text-sm text-[#647067]">
                    New notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      void handleNotificationClick(notification)
                    }
                    className={`flex w-full gap-3 border-b border-[#F0F2F0] px-4 py-3 text-left transition hover:bg-[#F8FAF8] ${
                      notification.readAt ? "bg-white" : "bg-[#F0F7F1]"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#1C2921]">
                          {notification.title}
                        </p>

                        {!notification.readAt && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-5 text-[#647067]">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-[#89938B]">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
