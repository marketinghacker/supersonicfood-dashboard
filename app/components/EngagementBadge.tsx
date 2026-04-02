'use client';

import type { EngagementQuadrant, SocialEngagement } from '../lib/config';

const QUADRANT_CONFIG: Record<EngagementQuadrant, { label: string; color: string; bg: string }> = {
  viral_winner: { label: '★ Gwiazda', color: 'text-amber-300', bg: 'bg-amber-400/15' },
  engagement_trap: { label: 'Angażuje, nie konwertuje', color: 'text-orange-300', bg: 'bg-orange-400/15' },
  silent_converter: { label: 'Cichy sprzedawca', color: 'text-blue-300', bg: 'bg-blue-400/15' },
  needs_work: { label: 'Do wyłączenia', color: 'text-red-300', bg: 'bg-red-400/15' },
  no_data: { label: '', color: 'text-gray-300', bg: '' },
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
      <span className={`text-sm font-bold px-2.5 py-1 rounded ${cfg.bg} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold px-3 py-1 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
      </div>
      <div className="flex items-center gap-4 text-sm font-semibold text-gray-200">
        {engagement.reactions > 0 && <span>❤️ {engagement.reactions}</span>}
        {engagement.comments > 0 && <span>💬 {engagement.comments}</span>}
        {engagement.shares > 0 && <span>↗️ {engagement.shares}</span>}
        {engagement.saves > 0 && <span>🔖 {engagement.saves}</span>}
      </div>
    </div>
  );
}
