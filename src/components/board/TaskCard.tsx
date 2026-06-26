import React from 'react';
import { User, Calendar } from 'lucide-react';

import type { Task } from '../../types/board';

interface TaskCardProps {
  task: Task;
  isProjectArchived: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onClick: (task: Task) => void;
}

const getPriorityStyle = (priority: Task['priority']) => {
  switch (priority) {
    case 'URGENT':
      return 'border-l-4 border-l-orange-deep bg-orange-deep/5 text-orange-hot';
    case 'HIGH':
      return 'border-l-4 border-l-orange-accent bg-orange-accent/5 text-orange-accent';
    case 'MEDIUM':
      return 'border-l-4 border-l-ink text-ink bg-ink/5';
    case 'LOW':
      return 'border-l-4 border-l-ink/20 text-ink/60 bg-bone-dark';
    default:
      return 'border-l-4 border-l-ink';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isProjectArchived,
  onDragStart,
  onClick,
}) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'DONE';

  return (
    <div
      draggable={!isProjectArchived}
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className={`p-4 bg-bone border border-ink/10 hover:border-ink/35 transition-all shadow-sm hover:shadow-md cursor-pointer relative group overflow-hidden min-w-0 ${getPriorityStyle(
        task.priority
      )} ${isProjectArchived ? 'opacity-85 hover:border-ink/10' : ''}`}
    >
      <span className="krumos-eyebrow text-[8px] text-ink/40 tracking-widest uppercase block mb-1">
        {task.priority}
      </span>
      <h4 className="text-xs font-bold text-ink uppercase tracking-wide group-hover:text-orange-accent transition-colors break-words">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] text-ink-text/85 truncate mt-1">
          {task.description}
        </p>
      )}

      {/* Task Card Footer */}
      <div className="flex items-center justify-between border-t border-ink/5 mt-3 pt-2.5">
        {/* Assignee badge */}
        <div className="flex items-center space-x-1.5 min-w-0">
          {task.assignee ? (
            <>
              <img
                src={task.assignee.picture || 'https://via.placeholder.com/150'}
                alt={task.assignee.name}
                className="w-4.5 h-4.5 rounded-none border border-ink/10 shrink-0"
              />
              <span className="text-[9px] font-mono text-ink/75 truncate uppercase">
                {task.assignee.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <User size={10} className="text-ink/40" />
              <span className="text-[8px] font-mono text-ink/40 uppercase italic">
                Unassigned
              </span>
            </>
          )}
        </div>

        {/* Due date badge */}
        {task.dueDate && (
          <span
            className={`text-[8px] font-mono flex items-center space-x-0.5 shrink-0 ${
              isOverdue
                ? 'text-orange-accent font-bold animate-pulse'
                : 'text-ink/50'
            }`}
          >
            <Calendar size={8} />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </span>
        )}
      </div>
    </div>
  );
};
