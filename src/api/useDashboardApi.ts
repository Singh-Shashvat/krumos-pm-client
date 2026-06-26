import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import queryKeys from './queryKeys';

import type {
  DashboardSummaryResponse,
  DashboardAnalyticsResponse,
} from '../types/dashboard';

export const useGetDashboardSummary = (workspaceId?: string) => {
  return useQuery<DashboardSummaryResponse>({
    queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/dashboard`);
      return res.data;
    },
    enabled: !!workspaceId,
  });
};

export const useGetDashboardAnalytics = (
  workspaceId?: string,
  enabled = true
) => {
  return useQuery<DashboardAnalyticsResponse>({
    queryKey: [queryKeys.GET_DASHBOARD_ANALYTICS, workspaceId],
    queryFn: async () => {
      const res = await api.get(
        `/workspaces/${workspaceId}/dashboard/analytics`
      );
      return res.data;
    },
    enabled: !!workspaceId && enabled,
  });
};
