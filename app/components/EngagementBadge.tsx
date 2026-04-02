'use client';

import type { EngagementQuadrant, SocialEngagement } from '../lib/config';

const QUADRANT_CONFIG: Record<EngagementQuadrant, { label: string; color: string; bg: string }> = {
  viral_winner: { label: 'Viral Winner', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  engagement_trap: { label: 'Engagement Trap', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  silent_converter: { label: 'Silent Converter', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  needs_work: { label: 'Do poprawy', color: 'text-red-400', bg: 'bg-red-400/10' },
  no_data: { label: '', color: 'text-gray-500', bg: '' },
};

interface EngagementBadgeProps {
  quadrant: EngagementQuadrant;
  engagement: SocialEngagement;
  compact?: boolean;
}

export default function EngagementBadge({ quadrant, engagement, compact }: EngagementBadgeProps) {
  if (quadrant === 'no_data') return null;

  const cfg = QUADRANT_CONFIG[quadrant];

  if (compact) {
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {engagement.reactions > 0 && <span>❤️ {engagement.reactions}</span>}
        {engagement.comments > 0 && <span>💬 {engagement.comments}</span>}
        {engagement.shares > 0 && <span>🔗 {engagement.shares}</span>}
        {engagement.saves > 0 && <span>🔖 {engagement.saves}</span>}
      </div>
    </div>
  );
}
