"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X, User, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface NavbarNotification {
  id: number;
  title: string;
  description: string;
}

const getNotificationStorageKey = (userId: string) => `medmatch:notifications:${userId}`;

const readStoredNotifications = (userId: string): NavbarNotification[] => {
  try {
    const stored = localStorage.getItem(getNotificationStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeStoredNotifications = (userId: string, items: NavbarNotification[]) => {
  localStorage.setItem(getNotificationStorageKey(userId), JSON.stringify(items.slice(0, 5)));
};

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState<NavbarNotification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      setNotifications([]);
      setIsNotificationsOpen(false);
      return;
    }

    const storedNotifications = readStoredNotifications(user._id);
    setNotifications(storedNotifications);

    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<Partial<NavbarNotification>>).detail;
      const notification = {
        id: Date.now(),
        title: detail?.title || "Appointment Update",
        description: detail?.description || "Your booking status has changed.",
      };

      setUnreadNotifications((count) => count + 1);
      setNotifications((items) => {
        const nextItems = [notification, ...items].slice(0, 5);
        writeStoredNotifications(user._id, nextItems);
        return nextItems;
      });
    };

    window.addEventListener("medmatch:notification", handleNotification);
    return () => {
      window.removeEventListener("medmatch:notification", handleNotification);
    };
  }, [user]);

  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  if (
    !pathname ||
    pathname.includes("/login") || 
    pathname.includes("/register") || 
    pathname.startsWith("/admin")
  ) return null;

  const navLinks = [
    { name: "Find Specialists", href: "/doctors" },
    ...(user ? [{ name: "Booking History", href: "/dashboard" }] : []),
    ...(user?.role === 'admin' ? [{ name: "Admin Panel", href: "/admin/dashboard" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-8 lg:px-24 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-ink-black flex items-center justify-center">
          <Stethoscope className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tighter uppercase hidden sm:block">MedMatch</span>
      </Link>

      <div className="hidden md:flex items-center gap-12">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href}
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
              pathname === link.href ? "text-deep-blue" : "text-slate-500 hover:text-slate-900"
            }`}>{link.name}</Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-slate-400">{user.name}</span>
            <div ref={notificationsRef} className="relative">
              <Button
                variant="ghost"
                type="button"
                aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
                aria-expanded={isNotificationsOpen}
                onClick={() => {
                  setIsNotificationsOpen((isOpen) => !isOpen);
                  setUnreadNotifications(0);
                }}
                className="relative h-10 w-10 p-0 flex items-center justify-center text-slate-400 hover:text-deep-blue"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 bg-deep-blue text-white text-[9px] font-bold leading-4 text-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 shadow-[8px_8px_0px_0px_rgba(11,11,11,0.08)] animate-slideDown">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-black">Notifications</h3>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {notifications.length} recent
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifications([]);
                            setUnreadNotifications(0);
                            writeStoredNotifications(user._id, []);
                          }}
                          className="text-[9px] font-bold uppercase tracking-widest text-deep-blue hover:text-ink-black"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="border-b border-slate-100 px-4 py-4 last:border-b-0">
                          <div className="text-xs font-bold uppercase tracking-widest text-ink-black">{notification.title}</div>
                          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{notification.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-400">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-ink-black">No notifications</div>
                        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                          Appointment confirmations will show up here.
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-deep-blue hover:bg-slate-50"
                  >
                    View booking history
                  </Link>
                </div>
              )}
            </div>
            <Button variant="ghost" onClick={logout} className="h-10 w-10 p-0 flex items-center justify-center text-slate-400 hover:text-red-500">
              <LogOut className="w-4 h-4" />
            </Button>
            <Link href="/dashboard">
              <Button variant="black" className="h-10 w-10 p-0 flex items-center justify-center"><User className="w-4 h-4" /></Button>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-[10px] uppercase tracking-widest font-bold">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="black" className="h-10 px-4 text-[10px] uppercase tracking-widest font-bold">Sign Up</Button>
            </Link>
          </>
        )}
        <button className="md:hidden w-10 h-10 flex items-center justify-center border border-slate-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 md:hidden animate-slideDown">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-bold uppercase tracking-tighter border-b border-slate-50 pb-4">{link.name}</Link>
          ))}
          {user ? (
            <Button variant="black" onClick={logout} className="w-full h-14 uppercase tracking-widest">Logout</Button>
          ) : (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="black" className="w-full h-14 uppercase tracking-widest">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
