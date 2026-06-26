import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useInviteMember } from '../../api/useMembersApi';
import { getMessageFromError } from '../../utils';

interface InviteMemberFormProps {
  workspaceId?: string;
}

export const InviteMemberForm: React.FC<InviteMemberFormProps> = ({
  workspaceId,
}) => {
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'MEMBER'>(
    'MEMBER'
  );
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const inviteMutation = useInviteMember(workspaceId);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setError('');
    setSuccess('');

    inviteMutation.mutate(
      { email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setSuccess(`Invitation sent successfully to ${inviteEmail}`);
          setInviteEmail('');
        },
        onError: (err: unknown) => {
          setError(getMessageFromError(err));
        },
      }
    );
  };

  return (
    <div className="lg:col-span-5 bg-bone-dark krumos-border p-6 flex flex-col">
      <div className="flex items-center space-x-2 mb-6 krumos-border-b pb-4">
        <Mail size={16} className="text-orange-accent" />
        <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
          DISPATCH INVITATION
        </h2>
      </div>

      <form onSubmit={handleInviteSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-orange-deep/20 border border-orange-accent/50 text-orange-hot font-mono text-[10px] uppercase">
            ERROR: {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-success-green/20 border border-success-green/50 text-success-green font-mono text-[10px] uppercase">
            {success}
          </div>
        )}

        <div className="space-y-1">
          <label className="krumos-eyebrow text-[9px] text-ink/60 block">
            MEMBER EMAIL
          </label>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="name@organization.com"
            className="w-full bg-bone border border-ink/20 px-3 py-2.5 text-xs font-sans text-ink focus:outline-none focus:border-orange-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="krumos-eyebrow text-[9px] text-ink/60 block">
            WORKSPACE ROLE
          </label>
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as 'ADMIN' | 'MANAGER' | 'MEMBER')
            }
            className="w-full bg-bone border border-ink/20 px-3 py-2.5 text-xs font-mono text-ink focus:outline-none focus:border-orange-accent"
          >
            <option value="MEMBER">MEMBER (Read/Write Tasks)</option>
            <option value="MANAGER">
              MANAGER (Manage Board, View Metrics)
            </option>
            <option value="ADMIN">ADMIN (Full Workspace Control)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!inviteEmail || inviteMutation.isPending}
          className="w-full bg-ink text-bone hover:bg-ink-soft py-3 px-6 krumos-mono-btn active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {inviteMutation.isPending ? 'SENDING...' : 'SEND EMAIL INVITATION'}
        </button>
      </form>
    </div>
  );
};
