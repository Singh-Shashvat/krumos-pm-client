import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import queryKeys from './queryKeys';

import type { Member, Invitation } from '../types/members';

// ------------------------------
// QUERIES
// ------------------------------

export const useGetMembers = (workspaceId?: string) => {
  return useQuery<Member[]>({
    queryKey: [queryKeys.GET_MEMBERS, workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      return res.data;
    },
    enabled: !!workspaceId,
  });
};

export const useGetInvitations = (workspaceId?: string, enabled = true) => {
  return useQuery<Invitation[]>({
    queryKey: [queryKeys.GET_INVITATIONS, workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/invitations`);
      return res.data;
    },
    enabled: !!workspaceId && enabled,
  });
};

// ------------------------------
// MUTATIONS
// ------------------------------

export const useInviteMember = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await api.post(
        `/workspaces/${workspaceId}/invitations`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_INVITATIONS, workspaceId],
      });
    },
  });
};

export const useUpdateMemberRole = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      const res = await api.patch(
        `/workspaces/${workspaceId}/members/${memberId}`,
        { role }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_MEMBERS, workspaceId],
      });
    },
  });
};

export const useDeleteMember = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await api.delete(
        `/workspaces/${workspaceId}/members/${memberId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_MEMBERS, workspaceId],
      });
    },
  });
};

export const useRevokeInvitation = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.delete(
        `/workspaces/${workspaceId}/invitations/${invitationId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_INVITATIONS, workspaceId],
      });
    },
  });
};
