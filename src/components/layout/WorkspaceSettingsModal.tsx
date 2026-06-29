import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { getMessageFromError } from '../../utils';
import { X } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeWorkspace,
    workspaces,
    setWorkspaces,
    deleteWorkspace,
    selectWorkspace,
  } = useWorkspace();
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [settingsWsName, setSettingsWsName] = useState('');
  const [settingsWsLogo, setSettingsWsLogo] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState('');

  // Deletion checks state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [confirmDeleteCheckbox, setConfirmDeleteCheckbox] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettingsWsName(activeWorkspace.name);
      setSettingsWsLogo(activeWorkspace.logo || '');
      setErrorSettings('');
      setShowConfirmDelete(false);
      setConfirmDeleteName('');
      setConfirmDeleteCheckbox(false);
    }
  }, [activeWorkspace, isOpen]);

  // Focus trap & Escape closing
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeWorkspace) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsWsName.trim()) return;
    setIsSavingSettings(true);
    setErrorSettings('');
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
      toast.success('Workspace details updated successfully');
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorSettings(getMessageFromError(err));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success('Workspace deleted successfully');
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorSettings(getMessageFromError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 krumos-overlay flex items-center justify-center z-[100] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div
        ref={modalRef}
        className="bg-dialog-bg text-dialog-fg border border-dialog-border max-w-lg w-full p-6 space-y-6 relative shadow-2xl"
      >
        <div className="space-y-2">
          <span className="krumos-eyebrow text-[9px] text-orange-accent">
            ADMIN GATEWAY
          </span>
          <h2
            id="settings-dialog-title"
            className="text-lg font-bold font-mono tracking-wider uppercase"
          >
            WORKSPACE SETTINGS
          </h2>
          <p className="text-xs text-white/50">
            Manage workspace branding or access the danger zone.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white hover:bg-white/5 p-1 rounded-none border border-transparent hover:border-white/10 transition-all cursor-pointer"
          aria-label="Close settings portal"
        >
          <X size={16} />
        </button>

        {errorSettings && (
          <div className="p-3 bg-orange-deep/20 border border-orange-accent/50 text-orange-hot font-mono text-[10px] uppercase">
            ERROR: {errorSettings}
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
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px] cursor-pointer"
                disabled={isSavingSettings}
              >
                CLOSE
              </button>
              <button
                type="submit"
                className="flex-1 bg-bone text-ink hover:bg-bone-dark py-2.5 krumos-mono-btn text-[10px] cursor-pointer"
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
              <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                Permanently delete this workspace and all associated projects,
                tasks, comments, and members. This action is absolute and cannot
                be undone.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDelete(true);
                  setErrorSettings('');
                }}
                className="w-full bg-orange-deep/25 border border-orange-accent/30 text-orange-hot hover:bg-orange-deep hover:text-white py-2.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                DELETE THIS WORKSPACE
              </button>
            </div>
          </form>
        ) : (
          /* Verification Pane */
          <form onSubmit={handleDeleteWorkspaceSubmit} className="space-y-6">
            <div className="p-4 bg-orange-deep/10 border border-orange-accent/30 text-orange-hot text-xs leading-relaxed space-y-2 font-sans">
              <p className="font-bold font-mono uppercase tracking-wider">
                CRITICAL ACTIONS REQUIRED
              </p>
              <p>
                You are about to delete the workspace{' '}
                <strong>{activeWorkspace.name}</strong>.
              </p>
              <p>
                All projects, tasks, timelines, comments, and roster profiles
                will be permanently erased.
              </p>
            </div>

            <div className="space-y-4">
              {/* Check 1: Confirmation checkbox */}
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmDeleteCheckbox}
                  onChange={(e) => setConfirmDeleteCheckbox(e.target.checked)}
                  className="mt-1 accent-orange-accent"
                />
                <span className="text-[11px] text-white/70 leading-relaxed font-sans">
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
                  setErrorSettings('');
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px] cursor-pointer"
                disabled={deleteLoading}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-deep text-white hover:bg-orange-deep/80 py-2.5 krumos-mono-btn text-[10px] disabled:opacity-30 cursor-pointer"
                disabled={
                  deleteLoading ||
                  !confirmDeleteCheckbox ||
                  confirmDeleteName !== activeWorkspace.name
                }
              >
                {deleteLoading ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
