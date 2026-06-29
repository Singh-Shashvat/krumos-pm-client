import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bell, BellRing } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="Toggle notifications menu"
      >
        {unreadCount > 0 ? (
          <BellRing size={16} className="text-orange-accent animate-bounce" />
        ) : (
          <Bell size={16} />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-orange-accent text-bone font-mono text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full leading-none scale-90">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-bone border border-ink shadow-2xl rounded-none py-1 z-30">
          <div className="flex justify-between items-center px-4 py-2 border-b border-ink/10 bg-bone-dark">
            <span className="krumos-eyebrow text-[9px] text-ink/60">
              NOTIFICATIONS
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setDropdownOpen(false);
                }}
                className="text-[9px] font-mono font-bold text-orange-accent hover:underline uppercase cursor-pointer"
              >
                Read All
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-ink/40 italic">
                No notifications found
              </div>
            ) : (
              notifications.filter(Boolean).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-ink/5 hover:bg-bone-dark transition-colors relative ${
                    !n.isRead
                      ? 'border-l-2 border-l-orange-accent bg-orange-accent/5'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start space-x-2">
                    <p className="text-[11px] font-bold text-ink uppercase tracking-wide">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-[8px] font-mono text-orange-accent hover:underline uppercase cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-ink-text leading-relaxed mt-1">
                    {n.message}
                  </p>
                  <span className="text-[8px] text-ink/40 font-mono mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
