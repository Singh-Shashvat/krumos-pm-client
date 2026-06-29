import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Plus, LogOut } from 'lucide-react';

interface WorkspaceSelectionOverlayProps {
  onCreateWorkspaceTrigger: () => void;
}

export const WorkspaceSelectionOverlay: React.FC<
  WorkspaceSelectionOverlayProps
> = ({ onCreateWorkspaceTrigger }) => {
  const { workspaces, selectWorkspace } = useWorkspace();
  const { logout } = useAuth();

  return (
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
            onClick={onCreateWorkspaceTrigger}
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
  );
};
