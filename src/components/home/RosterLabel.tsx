'use client';

import { useOrgName } from '@/lib/name';

/**
 * The woven label on the hero photo: roster number 036 (the minimum) and the
 * organization's name. It reads the sample name until someone types theirs in
 * the chapter below, then it is sewn with theirs.
 */
export default function RosterLabel({ className = '' }: { className?: string }) {
  const { name } = useOrgName();
  return (
    <span className={`woven woven-lg ${className}`}>
      <span>No. 036</span>
      <span aria-hidden>·</span>
      <span className="max-w-[30ch] overflow-hidden text-ellipsis">{name}</span>
    </span>
  );
}
