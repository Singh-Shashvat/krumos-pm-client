import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import queryKeys from './queryKeys';
import type { Task } from '../types/board';
import type { Comment, ActivityLog } from '../types/task';

// ------------------------------
// QUERIES
// ------------------------------

export const useGetTaskDetail = (workspaceId?: string, taskId?: string) => {
  return useQuery<Task>({
    queryKey: [queryKeys.GET_TASK_DETAIL, workspaceId, taskId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/tasks/${taskId}`);
      return res.data;
    },
    enabled: !!workspaceId && !!taskId,
  });
};

export const useGetComments = (workspaceId?: string, taskId?: string) => {
  return useQuery<Comment[]>({
    queryKey: [queryKeys.GET_TASK_COMMENTS, workspaceId, taskId],
    queryFn: async () => {
      const res = await api.get(
        `/workspaces/${workspaceId}/tasks/${taskId}/comments`
      );
      return res.data;
    },
    enabled: !!workspaceId && !!taskId,
  });
};

export const useGetTaskLogs = (workspaceId?: string, taskId?: string) => {
  return useQuery<ActivityLog[]>({
    queryKey: [queryKeys.GET_TASK_LOGS, workspaceId, taskId],
    queryFn: async () => {
      const res = await api.get(
        `/workspaces/${workspaceId}/tasks/${taskId}/logs`
      );
      return res.data;
    },
    enabled: !!workspaceId && !!taskId,
  });
};

// ------------------------------
// MUTATIONS
// ------------------------------

export const useUpdateTaskField = (workspaceId?: string, taskId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fields: Partial<Task>) => {
      const res = await api.patch(
        `/workspaces/${workspaceId}/tasks/${taskId}`,
        fields
      );
      return res.data;
    },
    onMutate: async (fields) => {
      // Cancel outgoing queries for task details
      await queryClient.cancelQueries({
        queryKey: [queryKeys.GET_TASK_DETAIL, workspaceId, taskId],
      });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData<Task>([
        queryKeys.GET_TASK_DETAIL,
        workspaceId,
        taskId,
      ]);

      // Optimistically update
      if (previousTask) {
        queryClient.setQueryData<Task>(
          [queryKeys.GET_TASK_DETAIL, workspaceId, taskId],
          { ...previousTask, ...fields }
        );
      }

      return { previousTask };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          [queryKeys.GET_TASK_DETAIL, workspaceId, taskId],
          context.previousTask
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_DETAIL, workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_LOGS, workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId],
      });
    },
  });
};

export const useAddComment = (workspaceId?: string, taskId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const res = await api.post(
        `/workspaces/${workspaceId}/tasks/${taskId}/comments`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_COMMENTS, workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_LOGS, workspaceId, taskId],
      });
    },
  });
};

export const useEditComment = (workspaceId?: string, taskId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      text,
    }: {
      commentId: string;
      text: string;
    }) => {
      const res = await api.patch(
        `/workspaces/${workspaceId}/comments/${commentId}`,
        { text }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_COMMENTS, workspaceId, taskId],
      });
    },
  });
};

export const useDeleteComment = (workspaceId?: string, taskId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await api.delete(
        `/workspaces/${workspaceId}/comments/${commentId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_COMMENTS, workspaceId, taskId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASK_LOGS, workspaceId, taskId],
      });
    },
  });
};
