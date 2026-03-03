'use client';

import { EyeOff, ShieldCheck, Trash2 } from 'lucide-react';

const items = [
  {
    icon: ShieldCheck,
    label: 'End-to-end encrypted',
    detail:
      'Your credentials are sent over HTTPS and held in a short-lived session cookie. They are never stored on disk.',
  },
  {
    icon: EyeOff,
    label: 'No password storage',
    detail:
      'We authenticate directly with Crunchyroll on your behalf. Your password is zeroed from memory after each request.',
  },
  {
    icon: Trash2,
    label: 'No data retention',
    detail:
      'Watch history is cached for 60 minutes to reduce API calls, then discarded. There is no database.',
  },
];

export function LoginTrustPanel() {
  return (
    <details className="group rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-medium text-[var(--text-muted)] select-none [&::-webkit-details-marker]:hidden">
        <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
        <span>How we protect your account</span>
        <svg
          className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="space-y-3 border-t border-[var(--border)] px-4 py-3">
        {items.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex gap-3">
            <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-500" />
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
