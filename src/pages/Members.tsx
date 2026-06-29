import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import queryKeys from '../api/queryKeys';
import {
  useGetMembers,
  useGetInvitations,
  useUpdateMemberRole,
  useDeleteMember,
  useRevokeInvitation,
} from '../api/useMembersApi';
import { Shield } from 'lucide-react';
import { getMessageFromError } from '../utils';
import { InviteMemberForm } from '../components/members/InviteMemberForm';
import { PendingInvitesList } from '../components/members/PendingInvitesList';
import { MemberListItem } from '../components/members/MemberListItem';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const Members: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { activeWorkspace, activeRole } = useWorkspace();
  const { registerListener } = useSocket();
  const toast = useToast();
  const queryClient = useQueryClient();

  const isAdmin = activeRole === 'ADMIN';

  // React Query Hooks
  const { data: members = [], isLoading: loadingMembers } = useGetMembers(
    activeWorkspace?.id
  );
  const { data: invitations = [], isLoading: loadingInvitations } =
    useGetInvitations(activeWorkspace?.id, isAdmin);

  const updateRoleMutation = useUpdateMemberRole(activeWorkspace?.id);
  const deleteMemberMutation = useDeleteMember(activeWorkspace?.id);
  const revokeInviteMutation = useRevokeInvitation(activeWorkspace?.id);

  const loading = loadingMembers || (isAdmin && loadingInvitations);

  // Confirmations
  const [confirmRevokeInviteId, setConfirmRevokeInviteId] = useState<
    string | null
  >(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Real-time roster listener
  useEffect(() => {
    if (!activeWorkspace) return;
    const unbind = registerListener('member_updated', () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_MEMBERS, activeWorkspace.id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_INVITATIONS, activeWorkspace.id],
      });
    });
    return () => unbind();
  }, [activeWorkspace, queryClient, registerListener]);

  const handleRevokeInviteClick = (inviteId: string) => {
    setConfirmRevokeInviteId(inviteId);
  };

  const handleRevokeInviteConfirm = () => {
    if (!confirmRevokeInviteId) return;
    revokeInviteMutation.mutate(confirmRevokeInviteId, {
      onSuccess: () => {
        toast.success('Invitation revoked successfully');
        setConfirmRevokeInviteId(null);
      },
      onError: (err: unknown) => {
        console.error('Failed to revoke invite', err);
        toast.error(getMessageFromError(err));
        setConfirmRevokeInviteId(null);
      },
    });
  };

  const handleRoleChange = (
    memberId: string,
    newRole: 'ADMIN' | 'MANAGER' | 'MEMBER'
  ) => {
    updateRoleMutation.mutate(
      { memberId, role: newRole },
      {
        onSuccess: () => {
          toast.success('Member role updated successfully');
        },
        onError: (err: unknown) => {
          toast.error(getMessageFromError(err));
        },
      }
    );
  };

  const handleRemoveMemberClick = (memberId: string, name: string) => {
    setConfirmRemoveMember({ id: memberId, name });
  };

  const handleRemoveMemberConfirm = () => {
    if (!confirmRemoveMember) return;
    deleteMemberMutation.mutate(confirmRemoveMember.id, {
      onSuccess: () => {
        toast.success(`Removed ${confirmRemoveMember.name} from workspace`);
        setConfirmRemoveMember(null);
      },
      onError: (err: unknown) => {
        toast.error(getMessageFromError(err));
        setConfirmRemoveMember(null);
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-bone-dark krumos-border p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink mx-auto mb-4"></div>
        <p className="krumos-eyebrow text-xs">Hydrating Roster Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 2-Column Grid for Invite and Pending (Admins Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <InviteMemberForm workspaceId={activeWorkspace?.id} />
          <PendingInvitesList
            invitations={invitations}
            onRevoke={handleRevokeInviteClick}
          />
        </div>
      )}

      {/* Roster list */}
      <div className="bg-bone-dark krumos-border p-6 min-w-0">
        <div className="flex items-center justify-between mb-6 krumos-border-b pb-4">
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-orange-accent" />
            <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
              WORKSPACE ROSTER
            </h2>
          </div>
          <span className="font-mono text-[9px] text-ink/40 uppercase">
            {members.length} MEMBER{members.length !== 1 && 'S'}
          </span>
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <MemberListItem
              key={member.id}
              member={member}
              currentUserId={currentUser?.id}
              isAdmin={isAdmin}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMemberClick}
            />
          ))}
        </div>
      </div>

      {/* Revoke Invite Confirmation */}
      <ConfirmDialog
        isOpen={confirmRevokeInviteId !== null}
        title="REVOKE INVITATION"
        message="Are you sure you want to revoke this pending invitation? The recipient will no longer be able to join the workspace with their invite link."
        onConfirm={handleRevokeInviteConfirm}
        onCancel={() => setConfirmRevokeInviteId(null)}
      />

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={confirmRemoveMember !== null}
        title="REMOVE MEMBER"
        message={`Are you sure you want to remove ${confirmRemoveMember?.name} from this workspace? they will lose access to all projects and tasks.`}
        onConfirm={handleRemoveMemberConfirm}
        onCancel={() => setConfirmRemoveMember(null)}
      />
    </div>
  );
};

export default Members;
