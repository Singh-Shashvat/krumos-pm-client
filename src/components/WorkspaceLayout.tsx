import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { WorkspaceSettingsModal } from './layout/WorkspaceSettingsModal';
import { WorkspaceSelectionOverlay } from './layout/WorkspaceSelectionOverlay';
import { getMessageFromError } from '../utils';

const WorkspaceLayout: React.FC = () => {
  const { activeWorkspace, createWorkspace, loadingWorkspaces } = useWorkspace();
  const toast = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [showWorkspaceSettings, setShowWorkspaceSettings] =
    useState<boolean>(false);
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

  if (loadingWorkspaces) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink select-none font-sans">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink mx-auto"></div>
          <p className="krumos-eyebrow text-sm">Loading Workspaces...</p>
        </div>
      </div>
    );
  }

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreateLoading(true);
    try {
      await createWorkspace(newWsName.trim());
      setNewWsName('');
      setShowCreateWs(false);
      toast.success('Workspace created successfully');
    } catch (err: unknown) {
      console.error(err);
      toast.error(getMessageFromError(err));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-bone text-ink overflow-hidden font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCreateWorkspaceTrigger={() => setShowCreateWs(true)}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header Navigation */}
        <TopBar
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowSettings={() => setShowWorkspaceSettings(true)}
        />

        {/* Dynamic Inner Outlet View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Modal Dialog for New Workspace Creation */}
      {showCreateWs && (
        <div className="fixed inset-0 krumos-overlay flex items-center justify-center z-[100] p-4 select-none">
          <div className="bg-dialog-bg text-dialog-fg border border-dialog-border max-w-sm w-full p-6 space-y-6 shadow-2xl">
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
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px] cursor-pointer"
                  disabled={createLoading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-bone text-ink hover:bg-bone-dark py-2.5 krumos-mono-btn text-[10px] cursor-pointer"
                  disabled={createLoading || !newWsName.trim()}
                >
                  {createLoading ? 'CREATING...' : 'CREATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog for Workspace Settings (Admins Only) */}
      <WorkspaceSettingsModal
        isOpen={showWorkspaceSettings}
        onClose={() => setShowWorkspaceSettings(false)}
      />

      {/* Full screen Workspace Selection Modal overlay if none active */}
      {!activeWorkspace && (
        <WorkspaceSelectionOverlay
          onCreateWorkspaceTrigger={() => setShowCreateWs(true)}
        />
      )}
    </div>
  );
};

export default WorkspaceLayout;
