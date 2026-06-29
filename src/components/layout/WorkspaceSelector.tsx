import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Check, Plus } from 'lucide-react';

interface WorkspaceSelectorProps {
  sidebarCollapsed: boolean;
  onCreateWorkspaceTrigger: () => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  sidebarCollapsed,
  onCreateWorkspaceTrigger,
}) => {
  const { workspaces, activeWorkspace, selectWorkspace } = useWorkspace();
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

  if (!activeWorkspace) {
    return !sidebarCollapsed ? (
      <div className="p-4 krumos-border-b border-ink/10 text-xs text-ink/50 font-mono">
        NO WORKSPACE
      </div>
    ) : null;
  }

  return (
    <div
      className="p-4 krumos-border-b border-ink/10 relative"
      ref={containerRef}
    >
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between bg-ink/5 border border-ink/10 hover:bg-ink/10 px-3 py-2 text-left focus:outline-none transition-all cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Workspace selector"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-5 h-5 bg-orange-accent text-bone flex items-center justify-center font-mono text-xs font-bold shrink-0">
            {activeWorkspace.logo ? (
              <img
                src={activeWorkspace.logo}
                alt={activeWorkspace.name}
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
          <span className="text-[10px] text-ink/40 font-mono tracking-widest leading-none">
            ▼
          </span>
        )}
      </button>

      {/* Workspace List Popover */}
      {dropdownOpen && !sidebarCollapsed && (
        <div className="absolute left-4 right-4 top-14 bg-sidebar-bg border border-ink/10 mt-1 shadow-2xl py-1 z-30 max-h-60 overflow-y-auto">
          <div className="px-3 py-1 text-[9px] krumos-eyebrow text-ink/40 border-b border-ink/5">
            SELECT WORKSPACE
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => {
                selectWorkspace(ws.id);
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-ink/5 text-xs transition-colors cursor-pointer ${
                activeWorkspace.id === ws.id
                  ? 'text-orange-accent font-bold bg-ink/5'
                  : 'text-sidebar-fg/70'
              }`}
            >
              <span className="truncate uppercase font-mono">{ws.name}</span>
              {activeWorkspace.id === ws.id && (
                <Check size={12} className="text-orange-accent" />
              )}
            </button>
          ))}
          <div className="border-t border-ink/5 mt-1">
            <button
              onClick={() => {
                onCreateWorkspaceTrigger();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-xs text-orange-accent font-bold hover:bg-ink/5 font-mono cursor-pointer"
            >
              <Plus size={12} />
              <span>CREATE WORKSPACE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
