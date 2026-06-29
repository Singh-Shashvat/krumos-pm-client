import React, { useState } from 'react';

import type { Member } from '../../types/members';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string;
    dueDate?: string;
  }) => void;
  members: Member[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  >('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
    });
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');
  };

  return (
    <div className="fixed inset-0 krumos-overlay flex items-center justify-center z-[100] p-4">
      <div className="bg-bone text-ink border border-ink/20 max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <span className="krumos-eyebrow text-[9px] text-orange-accent">
            TASK MANAGER
          </span>
          <h2 className="text-lg font-bold font-mono tracking-wider uppercase">
            CREATE TASK CARD
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="krumos-eyebrow text-[9px] text-ink/50 block">
              TASK TITLE
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix SSL Certificate Expiry"
              className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-sans text-ink placeholder:text-ink/40 focus:outline-none focus:border-orange-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="krumos-eyebrow text-[9px] text-ink/50 block">
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details explaining the objective..."
              rows={3}
              className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-sans text-ink placeholder:text-ink/40 focus:outline-none focus:border-orange-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="krumos-eyebrow text-[9px] text-ink/50 block">
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                  )
                }
                className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-mono text-ink focus:outline-none focus:border-orange-accent"
              >
                <option value="LOW" className="bg-bone text-ink">
                  LOW
                </option>
                <option value="MEDIUM" className="bg-bone text-ink">
                  MEDIUM
                </option>
                <option value="HIGH" className="bg-bone text-ink">
                  HIGH
                </option>
                <option value="URGENT" className="bg-bone text-ink">
                  URGENT
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="krumos-eyebrow text-[9px] text-ink/50 block">
                ASSIGNEE
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-mono text-ink focus:outline-none focus:border-orange-accent"
              >
                <option value="" className="bg-bone text-ink">
                  UNASSIGNED
                </option>
                {members.map((m) => (
                  <option
                    key={m.userId}
                    value={m.userId}
                    className="bg-bone text-ink"
                  >
                    {m.user?.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="krumos-eyebrow text-[9px] text-ink/50 block">
              DUE DATE
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-mono text-ink focus:outline-none focus:border-orange-accent"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-bone-dark hover:bg-bone border border-ink/15 py-2.5 krumos-mono-btn text-[10px] text-ink"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 bg-ink text-bone hover:bg-ink-soft py-2.5 krumos-mono-btn text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title.trim()}
            >
              CREATE CARD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
