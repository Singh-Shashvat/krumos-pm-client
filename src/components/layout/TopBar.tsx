import React from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useSocket } from '../../context/SocketContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Globe, Sun, Moon, Settings } from 'lucide-react';

interface TopBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  onToggleTheme,
  onShowSettings,
}) => {
  const { activeWorkspace, activeRole } = useWorkspace();
  const { connected } = useSocket();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/board')) return 'Kanban Board';
    if (path.startsWith('/members')) return 'Workspace Members';
    return 'Krumos';
  };

  return (
    <header className="h-[72px] bg-bone krumos-border-b flex justify-between items-center px-4 sm:px-8 shrink-0 z-20">
      <div className="flex items-center space-x-4">
        <h1 className="krumos-heading text-lg font-black tracking-tight text-ink uppercase">
          {getPageTitle()}
        </h1>
        {activeWorkspace && (
          <span className="hidden sm:inline-block font-mono text-[9px] border border-ink/10 px-2 py-0.5 tracking-widest text-ink/50 uppercase">
            {activeWorkspace.slug}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Socket Indicator */}
        <div className="flex items-center space-x-1">
          <Globe
            size={10}
            className={
              connected ? 'text-success-green animate-pulse' : 'text-ink/30'
            }
          />
          <span className="font-mono text-[8px] tracking-widest text-ink/40 uppercase hidden sm:inline">
            {connected ? 'LIVE' : 'SYNCING'}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none cursor-pointer"
          title={
            theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
          }
          aria-label={
            theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
          }
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notification Bell Dropdown Component */}
        <NotificationDropdown />

        {/* Workspace Settings (Admins Only) */}
        {activeRole === 'ADMIN' && (
          <button
            onClick={onShowSettings}
            className="p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none cursor-pointer"
            title="Workspace Settings"
            aria-label="Workspace Settings"
          >
            <Settings size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
