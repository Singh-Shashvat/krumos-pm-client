export interface SummaryStrip {
  TO_DO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
}

export interface ActivityItem {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
  performer: { id: string; name: string; picture: string } | null;
  task: { id: string; title: string } | null;
}

export interface DashboardTask {
  id: string;
  title: string;
  project?: {
    name: string;
  } | null;
  dueDate?: string | null;
  status: string;
  priority: string;
}

export interface DashboardSummaryResponse {
  summaryStrip: SummaryStrip;
  myTasks: DashboardTask[];
  recentActivity: ActivityItem[];
}

export interface TaskAnalytics {
  projectId: string;
  projectName: string;
  TO_DO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
}

export interface MemberWorkload {
  memberId: string;
  userId: string;
  name: string;
  picture: string;
  role: string;
  openTasksCount: number;
  completedThisWeekCount: number;
}

export interface DashboardAnalyticsResponse {
  tasksByProject: TaskAnalytics[];
  teamWorkload: MemberWorkload[];
}
