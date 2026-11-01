import { Bell, Menu, ShieldCheck, TrendingDown, Target, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface NotificationItem {
  id: number;
  icon: typeof TrendingDown;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    icon: TrendingDown,
    title: 'Food & Dining at 87%',
    body: 'Spent ₹4,350 of ₹5,000 monthly limit with 6 days remaining.',
    time: '2h ago',
    read: false,
  },
  {
    id: 2,
    icon: Target,
    title: 'Emergency fund milestone',
    body: 'Reached 68% of your ₹3,00,000 goal with recent deposit.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 3,
    icon: ShieldCheck,
    title: 'Session verified',
    body: 'Signed in from Windows · Chrome · Mumbai, IN.',
    time: '2d ago',
    read: true,
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markItemAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((v) => !v)}
        className="relative min-h-[44px] min-w-[44px] rounded-[4px] p-2 text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F5F5F5] transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#D4FF3A]"
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#D4FF3A]" />
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Notifications Panel"
          className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-[4px] border border-[#262626] bg-[#111111] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3 bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <span className="text-12 font-semibold tracking-wider uppercase text-[#F5F5F5]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-12 font-mono tabular-nums px-1.5 py-0.5 rounded-[2px] bg-[#262626] text-[#D4FF3A]">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-12 text-[#8A8A8A] hover:text-[#D4FF3A] transition-colors flex items-center gap-1"
              >
                <Check size={13} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#262626]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-12 text-[#8A8A8A]">
                No notifications to display.
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => markItemAsRead(item.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-[#1A1A1A] ${
                      !item.read ? 'bg-[#151515]' : 'bg-[#111111]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 rounded-[2px] p-1.5 bg-[#1C1C1C] border border-[#262626] text-[#F5F5F5]">
                      <Icon size={14} className={!item.read ? 'text-[#D4FF3A]' : 'text-[#8A8A8A]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-12 font-medium truncate ${!item.read ? 'text-[#F5F5F5]' : 'text-[#8A8A8A]'}`}>
                          {item.title}
                        </span>
                        <span className="text-12 tabular-nums font-mono text-[#8A8A8A] shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-12 text-[#8A8A8A] line-clamp-2 mt-0.5">
                        {item.body}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4FF3A]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#262626] bg-[#0A0A0A] px-4 py-2 text-center">
            <span className="text-12 text-[#8A8A8A] font-mono">
              FINORA System Notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const navigate = useNavigate();

  const initials = (user?.name || '?')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 bg-[#0A0A0A] border-b border-[#262626] transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileNav}
          className="min-h-[44px] min-w-[44px] rounded-[4px] p-2 text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F5F5F5] md:hidden transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#D4FF3A]"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex flex-col">
          <span className="text-14 font-medium text-[#F5F5F5]">
            {user?.name ? user.name : 'Rohit Kumar'}
          </span>
          <span className="text-12 text-[#8A8A8A]">{formattedDate} • Personal Ledger</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="relative h-9 w-9 min-h-[36px] min-w-[36px] rounded-[2px] border border-[#262626] hover:border-[#8A8A8A] transition-colors flex items-center justify-center bg-[#111111] text-12 font-medium text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#D4FF3A]"
          aria-label="Profile"
          title="View profile"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}

