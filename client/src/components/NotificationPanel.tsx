import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Notification } from "@/lib/types/notification";
import api from "@/services/axios";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils/time";

const PAGE_SIZE = 10;

type NotificationPanelProps = {
  closeNotificationPanel: () => void;
  unreadNotificationCount?: number;
  setUnreadNotificationCount?: (count: number) => void;
};

const mockNotifications = [
  {
    id: "1",
    title: "Payroll ready",
    body: "Your team's payroll for July is ready to review.",
    createdAt: new Date(),
    isRead: true,
  },
  {
    id: "2",
    title: "Leave approved",
    body: "Anna's leave request has been approved.",
    createdAt: "1d ago",
  },
  {
    id: "3",
    title: "New sign-in",
    body: "New sign-in from a new device for Mark.",
    createdAt: "3d ago",
  },
];

export default function NotificationPanel({
  closeNotificationPanel,
  unreadNotificationCount = 0,
  setUnreadNotificationCount,
}: NotificationPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([
    ...mockNotifications,
    ...mockNotifications,
    ...mockNotifications,
    ...mockNotifications,
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const inFlightRequestRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const lastLoadFailedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  const loadNotifications = async (page: number) => {
    if (inFlightRequestRef.current) return;

    inFlightRequestRef.current = true;
    setIsLoadingMore(true);

    try {
      const { data } = await api.get(
        `/notifications?page=${page}&limit=${PAGE_SIZE}`,
      );
      const nextNotifications = Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data)
          ? data
          : [];

      if (page === 1) {
        setAllNotifications(nextNotifications);
      } else {
        setAllNotifications((prev) => [...prev, ...nextNotifications]);
      }

      setCurrentPage(page);
      lastLoadFailedRef.current = false;
      setVisibleCount((prev) =>
        Math.max(
          PAGE_SIZE,
          Math.min(
            prev + nextNotifications.length,
            allNotifications.length + nextNotifications.length,
          ),
        ),
      );
    } catch {
      lastLoadFailedRef.current = true;
      toast.error("Failed to fetch notifications");
    } finally {
      inFlightRequestRef.current = false;
      setIsLoadingMore(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-as-read");
      setAllNotifications((prev) => {
        return prev.map((n) => ({ ...n, isRead: true }));
      });
    } catch {
      toast.error("Failed to mark read all notifications");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/mark-as-read`);
      if (setUnreadNotificationCount)
        setUnreadNotificationCount(unreadNotificationCount - 1);
    } catch {
      toast.error("Failed to mark the notification read");
    }
  };

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    void loadNotifications(1);
  }, []);

  const visibleNotifications = allNotifications.slice(
    0,
    Math.min(visibleCount, allNotifications.length || PAGE_SIZE),
  );
  const hasMoreNotifications =
    allNotifications.length > visibleCount && allNotifications.length > 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeNotificationPanel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeNotificationPanel]);

  function handleScroll() {
    const container = listRef.current;
    if (!container || isLoadingMore || inFlightRequestRef.current) return;

    const isNearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 25;
    const isScrollingDown = container.scrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = container.scrollTop;

    if (!isNearBottom || !hasMoreNotifications || !isScrollingDown) return;

    const nextPage = currentPage + 1;

    if (lastLoadFailedRef.current) {
      lastLoadFailedRef.current = false;
    }

    loadNotifications(nextPage);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeNotificationPanel}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity md:hidden"
        aria-hidden
      />

      <div className="fixed z-50 right-4 top-16 md:top-14">
        {/* Desktop / large screens: dropdown panel */}
        <div className="hidden md:block">
          <div className="w-96 max-w-screen-sm">
            <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    Notifications
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {unreadNotificationCount} new
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={closeNotificationPanel}
                    aria-label="Close notifications"
                    className="rounded p-1 text-zinc-500 hover:text-zinc-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                ref={listRef}
                onScroll={handleScroll}
                className="max-h-80 overflow-y-auto sidebar-scroll"
              >
                <ul className="divide-y divide-zinc-200">
                  {visibleNotifications.map((n) => (
                    <li key={n.id} className="px-4 py-3 hover:bg-zinc-50">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 h-3.5 w-3.5 rounded-full bg-theme shrink-0"
                          aria-hidden={!n.isRead}
                          style={{ opacity: n.isRead ? 1 : 0.15 }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-medium text-zinc-800">
                              {n.title}
                            </p>
                            <p className="ml-auto shrink-0 text-[10px] text-zinc-500 whitespace-nowrap">
                              {formatRelativeTime(n.createdAt)}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="text-xs text-zinc-600 truncate">
                              {n.body}
                            </p>
                            {!n.isRead && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="shrink-0 text-[10px] font-medium text-zinc-600 hover:text-zinc-800"
                                aria-label={`Mark ${n.title} as read`}
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {isLoadingMore && hasMoreNotifications && (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-zinc-500">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                    Loading more notifications...
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3">
                <button
                  onClick={markAllAsRead}
                  className="w-full text-right text-sm text-zinc-700 hover:text-zinc-900"
                  aria-label="Mark all as read"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: top sheet */}
        <div className="md:hidden">
          <div className="fixed inset-x-0 top-0 z-50">
            <div className="mx-3 mt-3">
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    Notifications
                  </h3>
                  <button
                    onClick={closeNotificationPanel}
                    aria-label="Close"
                    className="p-1 text-zinc-500 hover:text-zinc-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div
                  ref={listRef}
                  onScroll={handleScroll}
                  className="max-h-[70vh] overflow-y-auto px-4 pb-4 sidebar-scroll"
                >
                  <ul className="divide-y divide-zinc-200">
                    {visibleNotifications.map((n) => (
                      <li key={n.id} className="py-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-0.5 h-3.5 w-3.5 rounded-full bg-theme shrink-0"
                            style={{ opacity: n.isRead ? 1 : 0.15 }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate text-sm font-medium text-zinc-800">
                                {n.title}
                              </p>
                              <p className="ml-auto shrink-0 text-[10px] text-zinc-500 whitespace-nowrap">
                                {formatRelativeTime(n.createdAt)}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="text-xs text-zinc-600 truncate">
                                {n.body}
                              </p>
                              {!n.isRead && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="shrink-0 text-[10px] font-medium text-zinc-600 hover:text-zinc-800"
                                  aria-label={`Mark ${n.title} as read`}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {isLoadingMore && hasMoreNotifications && (
                    <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-500">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                      Loading more notifications...
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3">
                  <button
                    onClick={markAllAsRead}
                    className="w-full text-right text-sm text-zinc-700 hover:text-zinc-900"
                    aria-label="Mark all as read"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
