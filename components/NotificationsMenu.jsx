"use client";

import Link from "next/link";
import { Bell, Heart, Reply } from "lucide-react";

function getNotificationIcon(type) {
  if (type === "reply") return Reply;
  return Heart;
}

function getNotificationAccent(type) {
  if (type === "reply") {
    return "bg-blue-50 text-blue-700 dark:bg-cyan-950/35 dark:text-cyan-300";
  }

  return "bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300";
}

export default function NotificationsMenu({
  buttonClassName = "",
  panelClassName = "",
  isOpen = false,
  isLoading = false,
  unreadCount = 0,
  notifications = [],
  onToggle,
  onClose,
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={buttonClassName}
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
        ) : null}
      </button>

      {isOpen ? (
        <div
          className={`absolute right-0 top-full z-[90] mt-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/95 dark:shadow-[0_22px_56px_rgba(2,6,23,0.72)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[64px] max-sm:mt-0 max-sm:w-auto max-sm:rounded-2xl ${panelClassName}`}
        >
          <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} new update${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </p>
              </div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Bell size={16} />
              </div>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-2 py-2 max-sm:max-h-[calc(100dvh-172px)]">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <Bell size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Replies and likes on your posts or comments will show up here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const content = (
                  <div className="flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900/80">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${getNotificationAccent(notification.type)}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {notification.timeAgo}
                        </span>
                      </div>
                      {notification.message ? (
                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {notification.message}
                        </p>
                      ) : null}
                      {notification.meta ? (
                        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          {notification.meta}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );

                if (notification.href) {
                  return (
                    <Link key={notification.id} href={notification.href} onClick={onClose}>
                      {content}
                    </Link>
                  );
                }

                return <div key={notification.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
