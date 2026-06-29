import React, { useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 krumos-overlay flex items-center justify-center z-[100] p-4">
      <div className="bg-bone text-ink border border-ink/20 max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <span className="krumos-eyebrow text-[9px] text-orange-accent">
            ADMIN GATEWAY
          </span>
          <h2 className="text-lg font-bold font-mono tracking-wider uppercase">
            CREATE NEW PROJECT
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="krumos-eyebrow text-[9px] text-ink/50 block">
              PROJECT NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NextGen API Refactor"
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
              placeholder="Details concerning requirements..."
              rows={3}
              className="w-full bg-bone-dark/50 border border-ink/20 px-3 py-2.5 text-xs font-sans text-ink placeholder:text-ink/40 focus:outline-none focus:border-orange-accent resize-none"
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
              disabled={!name.trim()}
            >
              CREATE PROJECT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
