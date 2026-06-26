import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  BellRing,
  Globe,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

const WorkspaceLayout: React.FC = () => {
  const {
    user,
    workspaces,
    activeWorkspace,
    activeRole,
    selectWorkspace,
    createWorkspace,
    deleteWorkspace,
    setWorkspaces,
    logout,
  } = useAuth();

  const { notifications, unreadCount, markAsRead, markAllAsRead, connected } =
    useSocket();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [wsDropdownOpen, setWsDropdownOpen] = useState<boolean>(false);
  const [bellDropdownOpen, setBellDropdownOpen] = useState<boolean>(false);
  const [showCreateWs, setShowCreateWs] = useState<boolean>(false);
  const [newWsName, setNewWsName] = useState<string>('');
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('krumos_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('krumos_theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Workspace Settings (Admins Only) state
  const [showWorkspaceSettings, setShowWorkspaceSettings] =
    useState<boolean>(false);
  const [settingsWsName, setSettingsWsName] = useState<string>('');
  const [settingsWsLogo, setSettingsWsLogo] = useState<string>('');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [errorSettings, setErrorSettings] = useState<string>('');
  const [successSettings, setSuccessSettings] = useState<string>('');

  // Deletion checks state
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');
  const [confirmDeleteCheckbox, setConfirmDeleteCheckbox] =
    useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeWorkspace) {
      setSettingsWsName(activeWorkspace.name);
      setSettingsWsLogo(activeWorkspace.logo || '');
    }
  }, [activeWorkspace, showWorkspaceSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !settingsWsName.trim()) return;
    setIsSavingSettings(true);
    setErrorSettings('');
    setSuccessSettings('');
    try {
      const res = await api.patch(`/workspaces/${activeWorkspace.id}`, {
        name: settingsWsName.trim(),
        logo: settingsWsLogo.trim() || null,
      });

      const updatedWs = res.data;
      const updatedList = workspaces.map((w) =>
        w.id === activeWorkspace.id ? updatedWs : w
      );
      setWorkspaces(updatedList);
      await selectWorkspace(updatedWs.id);
      setSuccessSettings('Workspace details updated successfully');
    } catch (err: any) {
      console.error(err);
      setErrorSettings(
        err.response?.data?.message || 'Failed to update workspace details'
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    if (confirmDeleteName !== activeWorkspace.name) {
      setErrorSettings('Confirmation name does not match the workspace name');
      return;
    }
    if (!confirmDeleteCheckbox) {
      setErrorSettings('You must check the confirmation checkbox');
      return;
    }

    setDeleteLoading(true);
    setErrorSettings('');
    try {
      await deleteWorkspace(activeWorkspace.id, confirmDeleteName);
      setShowConfirmDelete(false);
      setShowWorkspaceSettings(false);
      setConfirmDeleteName('');
      setConfirmDeleteCheckbox(false);
    } catch (err: any) {
      console.error(err);
      setErrorSettings(
        err.response?.data?.message || 'Failed to delete workspace'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const wsDropdownRef = useRef<HTMLDivElement>(null);
  const bellDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        wsDropdownRef.current &&
        !wsDropdownRef.current.contains(e.target as Node)
      ) {
        setWsDropdownOpen(false);
      }
      if (
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(e.target as Node)
      ) {
        setBellDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreateLoading(true);
    try {
      await createWorkspace(newWsName);
      setNewWsName('');
      setShowCreateWs(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const pageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/board')) return 'Kanban Board';
    if (path.startsWith('/members')) return 'Workspace Members';
    return 'Krumos';
  };

  return (
    <div className="flex h-screen bg-bone text-ink overflow-hidden font-sans select-none">
      {/* Sidebar Overlay Container */}
      <div className="w-[72px] h-full shrink-0 relative z-30">
        <aside
          className={`bg-sidebar-bg text-sidebar-fg flex flex-col h-full krumos-border-r border-white/10 absolute top-0 bottom-0 left-0 transition-all duration-300 ${
            sidebarCollapsed ? 'w-[72px]' : 'w-[260px] shadow-2xl'
          }`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-8 bg-sidebar-bg border border-white/10 hover:bg-white/10 text-sidebar-fg p-1 rounded-full cursor-pointer z-30 transition-transform active:scale-90"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronLeft size={12} />
            )}
          </button>

          {/* Workspace Brand / Header */}
          <div className="krumos-border-b border-white/10 p-4 h-[72px] flex items-center justify-between relative">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-bone text-ink tracking-widest uppercase">
                  KM
                </span>
                <span className="krumos-heading text-md font-black tracking-tighter">
                  KRUMOS
                </span>
              </div>
            ) : (
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-bone text-ink tracking-widest uppercase mx-auto">
                KM
              </span>
            )}
          </div>

          {/* Workspace Selector Dropdown */}
          <div
            className="p-4 krumos-border-b border-white/10 relative"
            ref={wsDropdownRef}
          >
            {activeWorkspace ? (
              <div>
                <button
                  onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2 text-left focus:outline-none transition-all"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-5 h-5 bg-orange-accent text-bone flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {activeWorkspace.logo ? (
                        <img
                          src={activeWorkspace.logo}
                          alt="logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeWorkspace.name.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-xs font-bold truncate font-mono uppercase tracking-wider text-sidebar-fg">
                        {activeWorkspace.name}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-[10px] text-white/40 font-mono tracking-widest leading-none">
                      ▼
                    </span>
                  )}
                </button>

                {/* Workspace List Popover */}
                {wsDropdownOpen && !sidebarCollapsed && (
                  <div className="absolute left-4 right-4 top-14 bg-sidebar-bg border border-white/10 mt-1 shadow-2xl py-1 z-30 max-h-60 overflow-y-auto">
                    <div className="px-3 py-1 text-[9px] krumos-eyebrow text-white/40 border-b border-white/5">
                      SELECT WORKSPACE
                    </div>
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          selectWorkspace(ws.id);
                          setWsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 text-xs transition-colors ${
                          activeWorkspace.id === ws.id
                            ? 'text-orange-accent font-bold bg-white/5'
                            : 'text-sidebar-fg/70'
                        }`}
                      >
                        <span className="truncate uppercase font-mono">
                          {ws.name}
                        </span>
                        {activeWorkspace.id === ws.id && (
                          <Check size={12} className="text-orange-accent" />
                        )}
                      </button>
                    ))}
                    <div className="border-t border-white/5 mt-1">
                      <button
                        onClick={() => {
                          setShowCreateWs(true);
                          setWsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-xs text-orange-accent font-bold hover:bg-white/5 font-mono"
                      >
                        <Plus size={12} />
                        <span>CREATE WORKSPACE</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !sidebarCollapsed && (
                <div className="text-xs text-white/50 font-mono">
                  No Workspace
                </div>
              )
            )}
          </div>

          {/* Navigation Routes */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                  isActive
                    ? 'text-orange-accent font-bold bg-white/5'
                    : 'text-sidebar-fg/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={16} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/board"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                  isActive
                    ? 'text-orange-accent font-bold bg-white/5'
                    : 'text-sidebar-fg/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <KanbanSquare size={16} />
                  {!sidebarCollapsed && <span>Kanban Board</span>}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/members"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider relative ${
                  isActive
                    ? 'text-orange-accent font-bold bg-white/5'
                    : 'text-sidebar-fg/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Users size={16} />
                  {!sidebarCollapsed && <span>Members</span>}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-accent"></span>
                  )}
                </>
              )}
            </NavLink>
          </nav>

          {/* Footer User Drawer */}
          {user && (
            <div className="p-4 krumos-border-t border-white/10 flex flex-col space-y-4">
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={user.picture || 'https://via.placeholder.com/150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-none border border-white/10"
                  />
                  {!sidebarCollapsed && (
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-sidebar-fg truncate">
                        {user.name}
                      </p>
                      <p className="text-[9px] text-white/40 font-mono tracking-wider truncate uppercase">
                        {activeRole || 'MEMBER'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {!sidebarCollapsed && (
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-orange-deep/20 hover:text-orange-hot border border-white/10 px-3 py-2 text-xs font-mono tracking-wider text-sidebar-fg transition-all"
                >
                  <LogOut size={12} />
                  <span>SIGN OUT</span>
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header Navigation */}
        <header className="h-[72px] bg-bone krumos-border-b flex justify-between items-center px-4 sm:px-8 shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <h1 className="krumos-heading text-lg font-black tracking-tight text-ink uppercase">
              {pageTitle()}
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
              onClick={toggleTheme}
              className="p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none cursor-pointer"
              title={
                theme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={bellDropdownRef}>
              <button
                onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
                className="relative p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none"
              >
                {unreadCount > 0 ? (
                  <BellRing
                    size={16}
                    className="text-orange-accent animate-bounce"
                  />
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
              {bellDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-bone border border-ink shadow-2xl rounded-none py-1 z-30">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-ink/10 bg-bone-dark">
                    <span className="krumos-eyebrow text-[9px] text-ink/60">
                      NOTIFICATIONS
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[9px] font-mono font-bold text-orange-accent hover:underline uppercase"
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
                                className="text-[8px] font-mono text-orange-accent hover:underline uppercase"
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

            {/* Workspace Settings (Admins Only) */}
            {activeRole === 'ADMIN' && (
              <button
                onClick={() => {
                  setShowWorkspaceSettings(true);
                  setErrorSettings('');
                  setSuccessSettings('');
                }}
                className="p-2 text-ink hover:bg-ink/5 rounded-none border border-transparent hover:border-ink/10 transition-all focus:outline-none"
                title="Workspace Settings"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Inner Outlet View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Modal Dialog for New Workspace Creation */}
      {showCreateWs && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-dialog-bg text-dialog-fg border border-dialog-border max-w-sm w-full p-6 space-y-6">
            <div className="space-y-2">
              <span className="krumos-eyebrow text-[9px] text-orange-accent">
                ADMIN GATEWAY
              </span>
              <h2 className="text-lg font-bold font-mono tracking-wider uppercase">
                CREATE NEW WORKSPACE
              </h2>
            </div>
            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="krumos-eyebrow text-[9px] text-white/50 block">
                  WORKSPACE NAME
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Design Team"
                  className="w-full bg-bone/10 border border-white/20 px-3 py-2 text-xs font-sans text-dialog-fg focus:outline-none focus:border-orange-accent"
                  disabled={createLoading}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWs(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px]"
                  disabled={createLoading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bone text-ink hover:bg-bone-dark py-2.5 krumos-mono-btn text-[10px]"
                  disabled={createLoading || !newWsName.trim()}
                >
                  {createLoading ? 'CREATING...' : 'CREATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Workspace Settings & Deletion (Admins Only) */}
      {showWorkspaceSettings && activeWorkspace && activeRole === 'ADMIN' && (
        <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-dialog-bg text-dialog-fg border border-dialog-border max-w-lg w-full p-6 space-y-6 relative">
            <div className="space-y-2">
              <span className="krumos-eyebrow text-[9px] text-orange-accent">
                ADMIN GATEWAY
              </span>
              <h2 className="text-lg font-bold font-mono tracking-wider uppercase">
                WORKSPACE SETTINGS
              </h2>
              <p className="text-xs text-white/50">
                Manage workspace branding or access the danger zone.
              </p>
            </div>

            {errorSettings && (
              <div className="p-3 bg-orange-deep/20 border border-orange-accent/50 text-orange-hot font-mono text-[10px] uppercase">
                ERROR: {errorSettings}
              </div>
            )}
            {successSettings && (
              <div className="p-3 bg-success-green/20 border border-success-green/50 text-success-green font-mono text-[10px] uppercase">
                {successSettings}
              </div>
            )}

            {!showConfirmDelete ? (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="krumos-eyebrow text-[9px] text-white/50 block">
                      WORKSPACE NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsWsName}
                      onChange={(e) => setSettingsWsName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full bg-bone/10 border border-white/20 px-3 py-2.5 text-xs font-sans text-dialog-fg focus:outline-none focus:border-orange-accent"
                      disabled={isSavingSettings}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="krumos-eyebrow text-[9px] text-white/50 block">
                      WORKSPACE LOGO URL (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={settingsWsLogo}
                      onChange={(e) => setSettingsWsLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-bone/10 border border-white/20 px-3 py-2.5 text-xs font-sans text-dialog-fg focus:outline-none focus:border-orange-accent"
                      disabled={isSavingSettings}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWorkspaceSettings(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px]"
                    disabled={isSavingSettings}
                  >
                    CLOSE
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-bone text-ink hover:bg-bone-dark py-2.5 krumos-mono-btn text-[10px]"
                    disabled={isSavingSettings || !settingsWsName.trim()}
                  >
                    {isSavingSettings ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>

                {/* Danger Zone Section */}
                <div className="border-t border-orange-deep/30 pt-6 mt-6 space-y-4">
                  <div className="flex items-center space-x-2 text-orange-hot">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-orange-deep/20 border border-orange-accent/50 tracking-wider">
                      DANGER ZONE
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Permanently delete this workspace and all associated
                    projects, tasks, comments, and members. This action is
                    absolute and cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmDelete(true);
                      setErrorSettings('');
                      setSuccessSettings('');
                    }}
                    className="w-full bg-orange-deep/25 border border-orange-accent/30 text-orange-hot hover:bg-orange-deep hover:text-white py-2.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all"
                  >
                    DELETE THIS WORKSPACE
                  </button>
                </div>
              </form>
            ) : (
              /* Verification Pane */
              <form
                onSubmit={handleDeleteWorkspaceSubmit}
                className="space-y-6"
              >
                <div className="p-4 bg-orange-deep/10 border border-orange-accent/30 text-orange-hot text-xs leading-relaxed space-y-2">
                  <p className="font-bold font-mono uppercase tracking-wider">
                    CRITICAL ACTIONS REQUIRED
                  </p>
                  <p>
                    You are about to delete the workspace{' '}
                    <strong>{activeWorkspace.name}</strong>.
                  </p>
                  <p>
                    All projects, tasks, timelines, comments, and roster
                    profiles will be permanently erased from database systems.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Check 1: Confirmation checkbox */}
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmDeleteCheckbox}
                      onChange={(e) =>
                        setConfirmDeleteCheckbox(e.target.checked)
                      }
                      className="mt-1 accent-orange-accent"
                    />
                    <span className="text-[11px] text-white/70 leading-relaxed">
                      I understand that all workspace data will be permanently
                      destroyed and cannot be recovered.
                    </span>
                  </label>

                  {/* Check 2 & 3: Match workspace name */}
                  <div className="space-y-2">
                    <label className="krumos-eyebrow text-[9px] text-white/50 block">
                      CONFIRM WORKSPACE NAME
                    </label>
                    <p className="text-[10px] text-white/40 italic font-mono mb-1">
                      Please enter the name of the workspace to authorize:{' '}
                      <strong className="text-white select-all">
                        {activeWorkspace.name}
                      </strong>
                    </p>
                    <input
                      type="text"
                      required
                      value={confirmDeleteName}
                      onChange={(e) => setConfirmDeleteName(e.target.value)}
                      placeholder="Enter exact workspace name"
                      className="w-full bg-bone/10 border border-white/20 px-3 py-2.5 text-xs font-sans text-dialog-fg focus:outline-none focus:border-orange-accent"
                      disabled={deleteLoading}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmDelete(false);
                      setConfirmDeleteName('');
                      setConfirmDeleteCheckbox(false);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px]"
                    disabled={deleteLoading}
                  >
                    GO BACK
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-accent text-bone hover:bg-orange-deep py-2.5 krumos-mono-btn text-[10px] font-bold disabled:opacity-30 disabled:pointer-events-none"
                    disabled={
                      deleteLoading ||
                      !confirmDeleteCheckbox ||
                      confirmDeleteName !== activeWorkspace.name
                    }
                  >
                    {deleteLoading ? 'DELETING...' : 'CONFIRM ABSOLUTE DELETE'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full screen Workspace Selection Modal - Always Dark Mode */}
      {!activeWorkspace && (
        <div className="fixed inset-0 bg-[#1B1713]/95 backdrop-blur-md flex items-center justify-center z-[200] p-4 select-none font-sans text-[#F2EFE9]">
          <div className="max-w-md w-full p-8 border border-white/10 bg-[#1B1713] space-y-8 relative">
            <div className="space-y-2 text-center">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#F2EFE9] text-[#1B1713] tracking-widest uppercase">
                KM
              </span>
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase mt-4 text-[#F2EFE9]">
                SELECT A WORKSPACE
              </h2>
              <p className="text-xs text-white/50">
                Choose a workspace from the list below to continue to your
                dashboard.
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={async () => {
                    await selectWorkspace(ws.id);
                  }}
                  className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-accent px-4 py-3.5 text-left transition-all text-xs font-mono uppercase tracking-wider group cursor-pointer"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-5 h-5 bg-orange-accent text-[#F2EFE9] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {ws.logo ? (
                        <img
                          src={ws.logo}
                          alt="logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        ws.name.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <span className="truncate group-hover:text-orange-accent transition-colors text-white">
                      {ws.name}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-white/40 group-hover:text-orange-accent transition-colors"
                  />
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col space-y-3">
              <button
                onClick={() => setShowCreateWs(true)}
                className="w-full flex items-center justify-center space-x-2 bg-orange-accent hover:bg-orange-deep text-white px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>CREATE NEW WORKSPACE</span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-xs font-mono tracking-widest text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <LogOut size={12} />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;
