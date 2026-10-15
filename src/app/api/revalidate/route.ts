/**
 * `POST /api/revalidate` — the dashboard calls this after every catalog save, so a
 * change is on the site in seconds instead of on its next one-minute refresh.
 *
 * The caller proves itself with `x-revalidate-secret`, which must equal this site's
 * `CATALOG_REVALIDATE_SECRET` (the dashboard holds the same value). No secret set
 * here means every call is refused and the catalog just refreshes on its timer.
 */

import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

import { CATALOG_TAG } from '@/lib/catalog/api';

export const dynamic = 'force-dynamic';

function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CATALOG_REVALIDATE_SECRET?.trim();
  const given = request.headers.get('x-revalidate-secret') ?? '';
  if (!secret || !matches(given, secret)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  revalidateTag(CATALOG_TAG);
  return Response.json({ revalidated: true });
}
