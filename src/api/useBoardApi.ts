import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import queryKeys from './queryKeys';

import type { Project, Task } from '../types/board';

// ------------------------------
// QUERIES
// ------------------------------

export const useGetProjects = (workspaceId?: string) => {
  return useQuery<Project[]>({
    queryKey: [queryKeys.GET_PROJECTS, workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/projects`);
      return res.data;
    },
    enabled: !!workspaceId,
  });
};

export const useGetTasks = (
  workspaceId?: string,
  projectId?: string,
  filters?: { assigneeId?: string; priority?: string; dueFilter?: string }
) => {
  return useQuery<Task[]>({
    queryKey: [queryKeys.GET_TASKS, workspaceId, projectId, filters],
    queryFn: async () => {
      const res = await api.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        {
          params: filters,
        }
      );
      return res.data;
    },
    enabled: !!workspaceId && !!projectId,
  });
};

// ------------------------------
// MUTATIONS
// ------------------------------

export const useCreateProject = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await api.post(`/workspaces/${workspaceId}/projects`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_PROJECTS, workspaceId],
      });
    },
  });
};

export const useUpdateProject = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      ...data
    }: {
      projectId: string;
      name: string;
      description: string;
      status: 'ACTIVE' | 'ARCHIVED';
    }) => {
      const res = await api.put(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_PROJECTS, workspaceId],
      });
    },
  });
};

export const useDeleteProject = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      confirmName,
    }: {
      projectId: string;
      confirmName: string;
    }) => {
      const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        { data: { confirmName } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_PROJECTS, workspaceId],
      });
    },
  });
};

export const useCreateTask = (workspaceId?: string, projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      priority: string;
      assigneeId?: string;
      dueDate?: string;
    }) => {
      const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        data
      );
      return res.data;
    },
    onMutate: async (data) => {
      // Cancel outgoing queries for tasks
      await queryClient.cancelQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId, projectId],
      });

      // Snapshot previous values from all matching task queries
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({
        queryKey: [queryKeys.GET_TASKS, workspaceId, projectId],
      });

      const previousQueriesData = queries.map((query) => {
        return {
          queryKey: query.queryKey,
          data: queryClient.getQueryData(query.queryKey),
        };
      });

      // Optimistically add the new task
      const optimisticTask: Task = {
        id: 'temp-' + Date.now(),
        title: data.title,
        description: data.description,
        status: 'TO_DO',
        priority: data.priority as Task['priority'],
        order: 1, // Default order
        dueDate: data.dueDate || null,
        assigneeId: data.assigneeId || null,
      };

      queries.forEach((query) => {
        queryClient.setQueryData<Task[]>(query.queryKey, (oldTasks = []) => {
          return [...oldTasks, optimisticTask];
        });
      });

      return { previousQueriesData };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state if fails
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always invalidate to sync with server truth
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, workspaceId],
      });
    },
  });
};

export const useUpdateTask = (workspaceId?: string, projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      ...data
    }: {
      taskId: string;
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      order?: number;
    }) => {
      const res = await api.put(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, workspaceId],
      });
    },
  });
};

export const useDeleteTask = (workspaceId?: string, projectId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await api.delete(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, workspaceId],
      });
    },
  });
};

export const useMoveTask = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      order,
    }: {
      taskId: string;
      status: Task['status'];
      order: number;
    }) => {
      const res = await api.patch(
        `/workspaces/${workspaceId}/tasks/${taskId}/move`,
        { status, order }
      );
      return res.data;
    },
    onMutate: async ({ taskId, status, order }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId],
      });

      // Snapshot the previous values from all matching task queries
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({
        queryKey: [queryKeys.GET_TASKS, workspaceId],
      });

      const previousQueriesData = queries.map((query) => {
        return {
          queryKey: query.queryKey,
          data: queryClient.getQueryData(query.queryKey),
        };
      });

      // Optimistically update the task inside the queries
      queries.forEach((query) => {
        queryClient.setQueryData<Task[]>(query.queryKey, (oldTasks) => {
          if (!oldTasks) return oldTasks;
          return oldTasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, status, order };
            }
            return task;
          });
        });
      });

      // Return context with snapshotted values
      return { previousQueriesData };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state if fails
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always invalidate to sync with server truth
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_TASKS, workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, workspaceId],
      });
    },
  });
};

export const useArchiveProject = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      endpoint,
    }: {
      projectId: string;
      endpoint: 'archive' | 'activate';
    }) => {
      const res = await api.post(
        `/workspaces/${workspaceId}/projects/${projectId}/${endpoint}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_PROJECTS, workspaceId],
      });
    },
  });
};
