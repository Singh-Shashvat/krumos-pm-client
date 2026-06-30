import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WorkspaceSelector } from './WorkspaceSelector';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import krumosFullIcon from '../../assets/krumos_full_logo.svg';
import krumosIcon from '../../assets/favicon_v2.svg';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCreateWorkspaceTrigger: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCreateWorkspaceTrigger,
}) => {
  const { user, logout } = useAuth();
  const { activeRole } = useWorkspace();

  return (
    <div className="w-[72px] h-full shrink-0 relative z-30">
      <aside
        className={`bg-sidebar-bg text-sidebar-fg flex flex-col h-full krumos-border-r border-ink/10 absolute top-0 bottom-0 left-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px] shadow-2xl'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-8 bg-sidebar-bg border border-ink/10 hover:bg-ink/10 text-sidebar-fg p-1 rounded-full cursor-pointer z-30 transition-transform active:scale-90"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Workspace Brand / Header */}
        <div className="krumos-border-b border-ink/10 p-4 h-[72px] flex items-center justify-between relative">
          {!collapsed ? (
            <img src={krumosFullIcon} alt="KRUMOS" className="h-8 w-auto" />
          ) : (
            <img src={krumosIcon} alt="KRUMOS" className="h-8 w-auto mx-auto" />
          )}
        </div>

        {/* Workspace Selector Dropdown Component */}
        <WorkspaceSelector
          sidebarCollapsed={collapsed}
          onCreateWorkspaceTrigger={onCreateWorkspaceTrigger}
        />

        {/* Navigation Routes */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 hover:bg-ink/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                isActive
                  ? 'text-orange-accent font-bold bg-ink/5'
                  : 'text-sidebar-fg/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={16} />
                {!collapsed && <span>Dashboard</span>}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/board"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 hover:bg-ink/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                isActive
                  ? 'text-orange-accent font-bold bg-ink/5'
                  : 'text-sidebar-fg/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <KanbanSquare size={16} />
                {!collapsed && <span>Kanban Board</span>}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/members"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 hover:bg-ink/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                isActive
                  ? 'text-orange-accent font-bold bg-ink/5'
                  : 'text-sidebar-fg/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Users size={16} />
                {!collapsed && <span>Members</span>}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                )}
              </>
            )}
          </NavLink>
        </nav>

        {/* Footer User Drawer */}
        {user && (
          <div className="p-4 krumos-border-t border-ink/10 flex flex-col space-y-4">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-none border border-ink/10 bg-ink/5 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-sidebar-fg">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.substring(0, 1).toUpperCase()
                  )}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-sidebar-fg truncate">
                      {user.name}
                    </p>
                    <p className="text-[9px] text-ink/40 font-mono tracking-wider truncate uppercase">
                      {activeRole || 'MEMBER'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 bg-ink/5 hover:bg-orange-deep/20 hover:text-orange-hot border border-ink/10 px-3 py-2 text-xs font-mono tracking-wider text-sidebar-fg transition-all"
              >
                <LogOut size={12} />
                <span>SIGN OUT</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
