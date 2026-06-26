import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAppNavigate from '../hooks/useAppNavigate';
import { getMessageFromError } from '../utils';
import api from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useAppNavigate();
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState<string>('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate.toRoot();
      return;
    }

    if (!user) {
      // Not logged in: store token and send to login screen
      sessionStorage.setItem('krumos_invite_token', token);
      navigate.toLogin();
      return;
    }

    // User is logged in: accept invitation
    const accept = async () => {
      try {
        const res = await api.post('/auth/accept-invite', { token });
        setWorkspaceName(res.data.name);
        setStatus('success');
        sessionStorage.removeItem('krumos_invite_token');

        // Hydrate workspaces roster context
        await refreshUser();

        // Redirect after a few seconds
        setTimeout(() => {
          navigate.toRoot();
        }, 3000);
      } catch (err: unknown) {
        setStatus('error');
        setErrorMsg(getMessageFromError(err));
      }
    };

    accept();
  }, [token, user, navigate, refreshUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink p-6 select-none relative overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-ink"></div>
        <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-ink"></div>
      </div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        {status === 'processing' && (
          <div className="bg-ink text-bone p-8 border border-white/10 shadow-2xl space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-accent mx-auto"></div>
            <p className="krumos-eyebrow text-xs tracking-widest text-white/60">
              VALIDATING INVITATION...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-ink text-bone p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="w-12 h-12 bg-success-green/10 text-success-green flex items-center justify-center mx-auto border border-success-green/20">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-2">
              <p className="krumos-eyebrow text-[9px] text-success-green">
                ACCESS GRANTED
              </p>
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase">
                INVITATION ACCEPTED
              </h2>
              <p className="text-xs text-white/70 max-w-xs mx-auto mt-2">
                You have successfully joined the workspace{' '}
                <span className="text-orange-accent font-bold">
                  {workspaceName}
                </span>
                . Redirecting you to your board...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-ink text-bone p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="w-12 h-12 bg-orange-deep/10 text-orange-hot flex items-center justify-center mx-auto border border-orange-accent/20">
              <XCircle size={24} />
            </div>
            <div className="space-y-2">
              <p className="krumos-eyebrow text-[9px] text-orange-hot font-bold">
                ERROR SECURING ACCESS
              </p>
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase">
                VALIDATION FAILED
              </h2>
              <p className="text-xs text-white/60 max-w-xs mx-auto mt-2 leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => navigate.toRoot()}
              className="w-full bg-bone text-ink hover:bg-bone-dark py-3 px-6 krumos-mono-btn active:scale-[0.98] transition-all"
            >
              GO TO DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
