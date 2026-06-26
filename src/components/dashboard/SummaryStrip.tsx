import React from 'react';
import { CheckSquare } from 'lucide-react';
import type { SummaryStrip as ISummaryStrip } from '../../types/dashboard';

interface SummaryStripProps {
  summary: ISummaryStrip;
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({ summary }) => {
  const cards = [
    {
      key: 'TO_DO',
      title: 'To Do',
      count: summary.TO_DO,
      color: 'border-l-4 border-l-ink-soft',
    },
    {
      key: 'IN_PROGRESS',
      title: 'In Progress',
      count: summary.IN_PROGRESS,
      color: 'border-l-4 border-l-orange-accent',
    },
    {
      key: 'IN_REVIEW',
      title: 'In Review',
      count: summary.IN_REVIEW,
      color: 'border-l-4 border-l-orange-hot',
    },
    {
      key: 'DONE',
      title: 'Done',
      count: summary.DONE,
      color: 'border-l-4 border-l-success-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`bg-bone-dark krumos-border p-6 relative group overflow-hidden ${card.color}`}
        >
          <span className="krumos-eyebrow text-[9px] text-ink/40 tracking-wider block mb-1">
            TASK STATE
          </span>
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-ink/80">
            {card.title}
          </h3>
          <p className="text-4xl font-extrabold tracking-tighter mt-2 text-ink">
            {card.count}
          </p>
          <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckSquare size={48} />
          </div>
        </div>
      ))}
    </div>
  );
};
