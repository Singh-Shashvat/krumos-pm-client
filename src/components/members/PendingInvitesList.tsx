import React from 'react';
import { Clock } from 'lucide-react';
import type { Invitation } from '../../types/members';

interface PendingInvitesListProps {
  invitations: Invitation[];
  onRevoke: (inviteId: string) => void;
}

export const PendingInvitesList: React.FC<PendingInvitesListProps> = ({
  invitations,
  onRevoke,
}) => {
  return (
    <div className="lg:col-span-7 bg-bone-dark krumos-border p-6 flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-6 krumos-border-b pb-4">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-orange-accent" />
          <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
            PENDING DISPATCHES
          </h2>
        </div>
        <span className="font-mono text-[9px] text-ink/40 uppercase">
          72H EXPIRY
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3">
        {invitations.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-ink/40 italic">
            No pending invitations found.
          </div>
        ) : (
          invitations.map((invite) => (
            <div
              key={invite.id}
              className="p-3 bg-bone border border-ink/10 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink truncate">
                  {invite.email}
                </p>
                <span className="font-mono text-[8px] text-ink/40 tracking-wider uppercase block mt-0.5">
                  ROLE: {invite.role} · SENT:{' '}
                  {new Date(invite.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => onRevoke(invite.id)}
                className="text-[10px] font-mono text-orange-accent hover:underline font-bold uppercase tracking-wider px-2 py-1 bg-ink/5 border border-ink/15 hover:bg-orange-deep/10"
              >
                REVOKE
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
