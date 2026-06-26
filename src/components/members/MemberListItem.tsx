import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Member } from '../../types/members';

interface MemberListItemProps {
  member: Member;
  currentUserId?: string;
  isAdmin: boolean;
  onRoleChange: (
    memberId: string,
    role: 'ADMIN' | 'MANAGER' | 'MEMBER'
  ) => void;
  onRemove: (memberId: string, name: string) => void;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({
  member,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemove,
}) => {
  const isSelf =
    member.userId === currentUserId || member.user?.id === currentUserId;

  return (
    <div className="p-4 bg-bone border border-ink/10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      {/* User info details */}
      <div className="flex items-center space-x-4 min-w-0">
        <img
          src={member.user?.picture || 'https://via.placeholder.com/150'}
          alt={member.user?.name}
          className="w-10 h-10 border border-ink/10"
        />
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-bold text-ink uppercase truncate">
              {member.user?.name}
            </p>
            {isSelf && (
              <span className="font-mono text-[8px] bg-ink text-bone px-1 py-0.5 tracking-wider font-bold">
                YOU
              </span>
            )}
          </div>
          <p className="text-[10px] text-ink-text/70 truncate">
            {member.user?.email}
          </p>
          <span className="block text-[8px] text-ink/40 font-mono">
            JOINED: {new Date(member.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions & Role settings */}
      <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-ink/5">
        {/* Role Display/Selector */}
        {isAdmin && !isSelf ? (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[8px] text-ink/50 uppercase">
              ROLE:
            </span>
            <select
              value={member.role}
              onChange={(e) =>
                onRoleChange(
                  member.id,
                  e.target.value as 'ADMIN' | 'MANAGER' | 'MEMBER'
                )
              }
              className="bg-bone border border-ink/20 px-2 py-1 text-[10px] font-mono font-bold text-ink focus:outline-none focus:border-orange-accent"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        ) : (
          <span className="font-mono text-[9px] border border-ink/15 bg-ink/5 px-2.5 py-1 text-ink tracking-wider font-bold uppercase">
            {member.role}
          </span>
        )}

        {/* Delete Member */}
        {isAdmin && !isSelf && (
          <button
            onClick={() => onRemove(member.id, member.user.name)}
            className="text-orange-accent hover:text-orange-hot hover:bg-orange-deep/10 border border-transparent hover:border-orange-accent/20 p-2 transition-all cursor-pointer"
            title="Remove member"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
