'use client';

import { useOrgName } from '@/lib/name';

/**
 * The woven label on the hero photo: "Made for" and the organization's name. It reads the sample name until someone types theirs in
 * the chapter below, then it is sewn with theirs.
 */
export default function RosterLabel({ className = '' }: { className?: string }) {
  const { name } = useOrgName();
  return (
    <span className={`woven woven-lg !whitespace-normal ${className}`}>
      <span className="min-w-0 leading-tight [overflow-wrap:anywhere]">Made for {name}</span>
    </span>
  );
}
