import React from 'react';
import { Activity } from 'lucide-react';
import type { ActivityItem } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading,
}) => {
  return (
    <div className="lg:col-span-5 bg-bone-dark krumos-border p-6 flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-6 krumos-border-b pb-4">
        <div className="flex items-center space-x-2">
          <Activity size={16} className="text-orange-accent" />
          <h2 className="krumos-heading text-sm font-black text-ink uppercase tracking-wide">
            WORKSPACE ACTIVITY
          </h2>
        </div>
        <span className="font-mono text-[9px] text-ink/40 uppercase">
          LIVE FEEDS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-4 pr-2">
        {loading ? (
          <div className="py-8 text-center text-xs font-mono text-ink/40 italic">
            Loading activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-ink/40 italic">
            No activity logs available yet.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex space-x-3 text-xs">
              <img
                src={
                  act.performer?.picture || 'https://via.placeholder.com/150'
                }
                alt={act.performer?.name || 'User'}
                className="w-6 h-6 rounded-none border border-ink/10 shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-ink leading-relaxed">
                  <span className="font-bold text-ink uppercase">
                    {act.performer?.name || 'System'}
                  </span>{' '}
                  {act.description}
                </p>
                {act.task && (
                  <span className="inline-block font-mono text-[9px] text-orange-accent hover:underline cursor-pointer uppercase tracking-wide">
                    → Task: {act.task.title}
                  </span>
                )}
                <span className="block text-[8px] text-ink/40 font-mono">
                  {new Date(act.createdAt).toLocaleDateString()}{' '}
                  {new Date(act.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
