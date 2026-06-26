import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import queryKeys from '../api/queryKeys';
import {
  useGetDashboardSummary,
  useGetDashboardAnalytics,
} from '../api/useDashboardApi';
import { SummaryStrip } from '../components/dashboard/SummaryStrip';
import { MyTasksWidget } from '../components/dashboard/MyTasksWidget';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection';

const Dashboard: React.FC = () => {
  const { activeWorkspace, activeRole } = useAuth();
  const { registerListener } = useSocket();
  const queryClient = useQueryClient();

  const isPrivileged = activeRole === 'ADMIN' || activeRole === 'MANAGER';

  // React Query Hooks
  const { data: summaryData, isLoading: loadingSummary } =
    useGetDashboardSummary(activeWorkspace?.id);
  const { data: analyticsData, isLoading: loadingAnalytics } =
    useGetDashboardAnalytics(activeWorkspace?.id, isPrivileged);

  const summary = summaryData?.summaryStrip || {
    TO_DO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };
  const myTasks = summaryData?.myTasks || [];
  const activities = summaryData?.recentActivity || [];

  const tasksByProject = analyticsData?.tasksByProject || [];
  const teamWorkload = analyticsData?.teamWorkload || [];

  // Real-time auto sync
  useEffect(() => {
    if (!activeWorkspace) return;

    const unbindTaskUpdate = registerListener('task_updated', () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, activeWorkspace.id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_ANALYTICS, activeWorkspace.id],
      });
    });

    const unbindMemberUpdate = registerListener('member_updated', () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_SUMMARY, activeWorkspace.id],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.GET_DASHBOARD_ANALYTICS, activeWorkspace.id],
      });
    });

    return () => {
      unbindTaskUpdate();
      unbindMemberUpdate();
    };
  }, [activeWorkspace, queryClient, registerListener]);

  return (
    <div className="space-y-8 pb-12">
      {/* 4 Status Summary Strip Cards */}
      <SummaryStrip summary={summary} />

      {/* Main Grid: Tasks checklist & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <MyTasksWidget myTasks={myTasks} loading={loadingSummary} />
        <ActivityFeed activities={activities} loading={loadingSummary} />
      </div>

      {/* Analytics Section (ADMIN / MANAGER ONLY) */}
      <AnalyticsSection
        isPrivileged={isPrivileged}
        loading={loadingAnalytics}
        tasksByProject={tasksByProject}
        teamWorkload={teamWorkload}
      />
    </div>
  );
};

export default Dashboard;
