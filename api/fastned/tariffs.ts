import type { VercelRequest, VercelResponse } from '@vercel/node';

const UPSTREAM = 'https://uk-public.api.fastned.nl/uk-public/ocpi/cpo/2.2.1/tariffs';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const upstream = await fetch(UPSTREAM, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Fastned API returned ${upstream.status}` });
      return;
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, s-maxage=25, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(504).json({ error: msg });
  }
}
