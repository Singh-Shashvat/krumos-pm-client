import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Lock } from 'lucide-react';
import type { TaskAnalytics, MemberWorkload } from '../../types/dashboard';

interface AnalyticsSectionProps {
  isPrivileged: boolean;
  loading: boolean;
  tasksByProject: TaskAnalytics[];
  teamWorkload: MemberWorkload[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  isPrivileged,
  loading,
  tasksByProject,
  teamWorkload,
}) => {
  return (
    <div className="bg-bone-dark krumos-border p-6">
      <div className="flex justify-between items-center mb-6 krumos-border-b pb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 size={16} className="text-orange-accent" />
          <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
            PERFORMANCE ANALYTICS
          </h2>
        </div>
        <span className="font-mono text-[9px] text-ink/40 uppercase">
          GATED DATA STRIP
        </span>
      </div>

      {isPrivileged ? (
        loading ? (
          <div className="py-16 text-center text-xs font-mono text-ink/40 italic">
            Loading analytics graphs...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Tasks distribution by Project */}
            <div className="space-y-4">
              <span className="krumos-eyebrow text-[9px] text-ink/50 tracking-wider">
                PROJECT TASK DISTRIBUTIONS
              </span>
              <div className="h-[280px] w-full bg-bone p-4 border border-ink/10">
                {tasksByProject.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-ink/40 italic">
                    No active projects found
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={0}
                  >
                    <BarChart
                      data={tasksByProject}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-line)"
                      />
                      <XAxis
                        dataKey="projectName"
                        stroke="var(--ink)"
                        fontSize={9}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="var(--ink)"
                        fontSize={9}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--ink)',
                          border: 'none',
                          color: 'var(--bone)',
                          fontSize: 10,
                          fontFamily: 'Space Mono',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: 9,
                          fontFamily: 'Space Mono',
                        }}
                      />
                      <Bar
                        dataKey="TO_DO"
                        stackId="a"
                        fill="#4F4948"
                        name="To Do"
                      />
                      <Bar
                        dataKey="IN_PROGRESS"
                        stackId="a"
                        fill="#F44E14"
                        name="In Progress"
                      />
                      <Bar
                        dataKey="IN_REVIEW"
                        stackId="a"
                        fill="#FF6A2B"
                        name="In Review"
                      />
                      <Bar
                        dataKey="DONE"
                        stackId="a"
                        fill="#3DCC6D"
                        name="Done"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Member Workload Analysis */}
            <div className="space-y-4">
              <span className="krumos-eyebrow text-[9px] text-ink/50 tracking-wider">
                TEAM WORKLOAD DISTRIBUTIONS
              </span>
              <div className="h-[280px] w-full bg-bone p-4 border border-ink/10">
                {teamWorkload.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-ink/40 italic">
                    No members joined in workspace
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={0}
                  >
                    <BarChart
                      data={teamWorkload}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-line)"
                      />
                      <XAxis
                        type="number"
                        stroke="var(--ink)"
                        fontSize={9}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="var(--ink)"
                        fontSize={9}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--ink)',
                          border: 'none',
                          color: 'var(--bone)',
                          fontSize: 10,
                          fontFamily: 'Space Mono',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: 9,
                          fontFamily: 'Space Mono',
                        }}
                      />
                      <Bar
                        dataKey="openTasksCount"
                        fill="#F44E14"
                        name="Open Tasks"
                      />
                      <Bar
                        dataKey="completedThisWeekCount"
                        fill="#3DCC6D"
                        name="Completed (Week)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="py-12 border border-dashed border-ink/20 flex flex-col items-center justify-center text-center space-y-3">
          <Lock className="text-ink/30" size={24} />
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-ink uppercase tracking-wide">
              RESTRICTED SECURITY PROFILE
            </h3>
            <p className="text-[10px] text-ink/50 max-w-xs font-mono">
              Advanced performance metric analytics are strictly gated and
              visible to ADMIN or MANAGER roles only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
