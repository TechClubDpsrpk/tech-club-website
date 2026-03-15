'use client';

import React, { useState } from 'react';
import { Timeline } from '@/components/ui/timeline';
import { legacyData, type LegacyEntry } from '@/lib/legacyData';
import { motion, AnimatePresence } from 'motion/react';

// Roles that get large "headline" treatment vs grouped executive treatment
const HEADLINE_ROLES = [
  'President',
  'Presidents',
  'Vice President',
  'Vice Presidents',
  'Director',
  'Tech President',
  'Administrative President',
  'Tech Vice President',
  'Administrative Vice President',
];

function isHeadline(label: string) {
  return HEADLINE_ROLES.includes(label);
}

// ─── Committee Lineage Panel ──────────────────────────────────────────────────
function CommitteeLineage({ entry }: { entry: LegacyEntry }) {
  // Separate headline roles from grouped exec roles
  const headlineRoles = entry.roles.filter((r) => isHeadline(r.label));
  const execRoles = entry.roles.filter((r) => !isHeadline(r.label));

  // Merge exec sub-groups under their parent label
  const mergedExecs: {
    label: string;
    groups: { subLabel?: string; members: string[] }[];
  }[] = [];
  execRoles.forEach((role) => {
    const existing = mergedExecs.find((m) => m.label === role.label);
    if (existing) {
      existing.groups.push({ subLabel: role.subLabel, members: role.members });
    } else {
      mergedExecs.push({
        label: role.label,
        groups: [{ subLabel: role.subLabel, members: role.members }],
      });
    }
  });

  return (
    <div className="mt-6 space-y-6">
      {/* ── Headline roles (President, VP, Director…) ── */}
      {headlineRoles.length > 0 && (
        <div className="flex flex-wrap gap-x-14 gap-y-5">
          {headlineRoles.map((role) => (
            <div key={role.label}>
              <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[9px] tracking-[0.2em] text-yellow-500 uppercase">
                {role.label}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                {role.members.map((name) => (
                  <p
                    key={name}
                    className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-neutral-900 dark:text-white"
                  >
                    {name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thin separator between leadership and rest */}
      {headlineRoles.length > 0 && mergedExecs.length > 0 && (
        <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/60" />
      )}

      {/* ── Exec / creative / mentor roles ── */}
      {mergedExecs.length > 0 && (
        <div className="space-y-4">
          {mergedExecs.map(({ label, groups }) => (
            <div key={label} className="flex items-start gap-6">
              {/* Role label */}
              <span className="w-36 shrink-0 pt-px font-[family-name:var(--font-space-mono)] text-[9px] tracking-[0.18em] text-neutral-400 uppercase dark:text-neutral-600">
                {label}
              </span>

              {/* Groups */}
              <div className="flex flex-col gap-3">
                {groups.map((group, gi) => (
                  <div key={gi}>
                    {group.subLabel && (
                      <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[9px] tracking-widest text-neutral-300 uppercase dark:text-neutral-700">
                        {group.subLabel}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {group.members.map((name) => (
                        <span
                          key={name}
                          className="font-[family-name:var(--font-space-mono)] text-xs text-neutral-700 dark:text-neutral-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footnote note ── */}
      {entry.note && (
        <p className="border-l border-neutral-200 pl-3 font-[family-name:var(--font-space-mono)] text-xs leading-relaxed text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
          {entry.note}
        </p>
      )}
    </div>
  );
}

// ─── Year Content ─────────────────────────────────────────────────────────────
function YearContent({ entry, isLatest }: { entry: LegacyEntry; isLatest?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Description — always visible */}
      <p
        className="mb-5 text-xs leading-relaxed md:text-sm"
        style={{ color: isLatest ? '#F9CA24' : 'inherit' }}
      >
        {entry.description}
      </p>

      {/* Divider + toggle */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.2em] text-neutral-400 uppercase transition-colors hover:text-yellow-500 dark:text-neutral-600 dark:hover:text-yellow-500"
        >
          {open ? 'Hide Lineage' : 'Core Committee'}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="inline-block leading-none"
          >
            ↓
          </motion.span>
        </button>
      </div>

      {/* Inline expand */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="lineage"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CommitteeLineage entry={entry} />
            <div className="mt-6 h-px bg-neutral-200 dark:bg-neutral-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function LegacyTimeline() {
  const data = legacyData.map((entry, index) => ({
    title: entry.year,
    content: <YearContent entry={entry} isLatest={index === legacyData.length - 1} />,
  }));

  return (
    <div className="relative w-full overflow-x-hidden">
      <Timeline data={data} />
    </div>
  );
}

const LegacyPage = () => {
  return (
    <div className="mt-32 px-6 md:px-24 lg:px-32">
      <LegacyTimeline />
    </div>
  );
};

export default LegacyPage;
