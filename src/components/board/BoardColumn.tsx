import React from 'react';
import { TaskCard } from './TaskCard';

import type { Task } from '../../types/board';

interface BoardColumnProps {
  title: string;
  status: Task['status'];
  color: string;
  tasks: Task[];
  isProjectArchived: boolean;
  draggedOverColumn: string | null;
  onDragOver: (e: React.DragEvent, status: Task['status']) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: Task['status']) => void;
  onTaskDragStart: (e: React.DragEvent, taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  title,
  status,
  color,
  tasks,
  isProjectArchived,
  draggedOverColumn,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskDragStart,
  onTaskClick,
}) => {
  const isOver = draggedOverColumn === status;

  return (
    <div
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      className={`bg-bone-dark krumos-border flex flex-col max-h-[640px] transition-all ${
        isOver ? 'border-dashed border-orange-accent bg-orange-accent/5' : ''
      }`}
    >
      {/* Column Header */}
      <div
        className={`p-4 krumos-border-b flex justify-between items-center ${color}`}
      >
        <span className="font-mono text-[10px] font-bold tracking-widest">
          {title}
        </span>
        <span className="font-mono text-[10px] font-bold bg-ink text-bone px-1.5 py-0.25 leading-none">
          {tasks.length}
        </span>
      </div>

      {/* Tasks Cards Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-35">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isProjectArchived={isProjectArchived}
            onDragStart={onTaskDragStart}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-20 flex items-center justify-center text-center text-[9px] font-mono text-ink/45 italic border border-dashed border-ink/10">
            Empty column
          </div>
        )}
      </div>
    </div>
  );
};
