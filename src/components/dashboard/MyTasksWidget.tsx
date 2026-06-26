import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, CheckSquare, ArrowRight } from 'lucide-react';

import type { DashboardTask } from '../../types/dashboard';

interface MyTasksWidgetProps {
  myTasks: DashboardTask[];
  loading: boolean;
}

const STATUS_COLORS = {
  TO_DO: '#4F4948',
  IN_PROGRESS: '#F44E14',
  IN_REVIEW: '#FF6A2B',
  DONE: '#3DCC6D',
};

export const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({
  myTasks,
  loading,
}) => {
  return (
    <div className="lg:col-span-7 bg-bone-dark krumos-border p-6 flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-6 krumos-border-b pb-4">
        <div className="flex items-center space-x-2">
          <CheckSquare size={16} className="text-orange-accent" />
          <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
            MY ASSIGNED TASKS
          </h2>
        </div>
        <Link
          to="/board"
          className="krumos-mono-btn text-[9px] text-orange-accent flex items-center space-x-1 hover:underline"
        >
          <span>BOARD VIEW</span>
          <ArrowRight size={10} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-2">
        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-ink/40 italic">
            Loading tasks...
          </div>
        ) : myTasks.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-ink/40 italic">
            You have no tasks assigned in this workspace.
          </div>
        ) : (
          myTasks.map((task) => {
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.status !== 'DONE';
            return (
              <div
                key={task.id}
                className="p-4 bg-bone border border-ink/10 hover:border-ink/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 overflow-hidden min-w-0"
              >
                <div className="space-y-1 min-w-0 w-full">
                  <span className="font-mono text-[8px] tracking-widest text-ink/40 uppercase block truncate">
                    {task.project?.name}
                  </span>
                  <p className="text-xs font-bold text-ink uppercase tracking-wide break-words">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center space-x-1.5 text-[9px] font-mono text-ink/50 mt-1">
                      <Calendar size={10} />
                      <span>
                        DUE: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {isOverdue && (
                        <span className="text-orange-accent flex items-center space-x-0.5 font-bold animate-pulse">
                          <AlertTriangle size={8} />
                          <span>OVERDUE</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[9px] border border-ink/20 px-2 py-0.5 tracking-wider uppercase bg-bone text-ink/75">
                    {task.priority}
                  </span>
                  <span
                    className="font-mono text-[9px] text-bone px-2 py-0.5 tracking-wider uppercase font-bold"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[
                          task.status as keyof typeof STATUS_COLORS
                        ] || '#1B1713',
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
