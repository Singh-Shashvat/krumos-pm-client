import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { LogOut, ArrowRight, Server } from 'lucide-react';
import useAppNavigate from '../hooks/useAppNavigate';
import { getMessageFromError } from '../utils';

const Onboarding: React.FC = () => {
  const { logout } = useAuth();
  const { createWorkspace } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useAppNavigate();

  // Force light theme on onboarding page
  useEffect(() => {
    const prevDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => {
      // Restore on unmount if it was previously dark
      if (prevDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setError('Workspace name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createWorkspace(workspaceName);
      navigate.toRoot();
    } catch (err: unknown) {
      console.error(err);
      setError(getMessageFromError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bone text-ink relative overflow-hidden select-none">
      {/* Editorial architectural grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-ink"></div>
        <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-ink"></div>
      </div>

      {/* Header */}
      <header className="krumos-border-b flex justify-between items-center py-6 px-8 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2 py-1 bg-ink text-bone tracking-widest">
            KR-02
          </span>
          <span className="krumos-heading text-lg font-black tracking-tighter">
            KRUMOS
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity font-mono text-[10px] uppercase tracking-wider"
        >
          <LogOut size={12} />
          <span>SIGN OUT</span>
        </button>
      </header>

      {/* Form Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-none bg-ink text-bone flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Server size={20} className="text-orange-accent" />
            </div>
            <p className="krumos-eyebrow text-xs text-orange-accent">
              STEP 01 / INITIAL ONBOARDING
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">
              CREATE A WORKSPACE
            </h1>
            <p className="text-sm text-ink-text max-w-sm mx-auto">
              Every project and team member in Krumos lives inside a workspace.
              Set up your workspace to get started.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-ink text-bone p-8 border border-white/10 shadow-xl space-y-6"
          >
            {error && (
              <div className="p-3 bg-orange-deep/20 border border-orange-accent/50 text-orange-hot font-mono text-xs uppercase tracking-wide">
                ERROR: {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="workspaceName"
                className="krumos-eyebrow text-[10px] text-white/50 block"
              >
                WORKSPACE NAME
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full bg-bone/10 border border-white/20 px-4 py-3 text-sm font-sans tracking-wide text-bone placeholder-white/30 focus:outline-none focus:border-orange-accent transition-colors duration-200"
                disabled={loading}
              />
              <p className="text-[10px] text-white/30 font-mono italic">
                A unique URL slug will be automatically generated.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-bone text-ink hover:bg-bone-dark py-4 px-6 krumos-mono-btn active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{loading ? 'CREATING...' : 'PROCEED TO BOARD'}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </main>

      <footer className="krumos-border-t py-4 px-8 text-center sm:text-left text-[10px] font-mono opacity-50 relative z-10">
        © 2026 KRUMOS TECH LLP. SECURITY SCENARIO ISOLATED.
      </footer>
    </div>
  );
};

export default Onboarding;
