// pages/api/orders.js
// Proxies order data from HQ Apps Script.
// Vercel CDN caches each code's response for 28s → only 1 Apps Script
// call per code per 30s regardless of visitor count. Quota-safe.

export default async function handler(req, res) {
  const { code } = req.query;
  const HQ = process.env.HQ_ENDPOINT;

  if (!code || !HQ) {
    return res.status(400).json({ error: 'missing code or HQ not configured', orders: [] });
  }

  try {
    const upstream = await fetch(
      `${HQ}?action=orders&code=${encodeURIComponent(code)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!upstream.ok) {
      return res.status(502).json({ error: 'upstream error', orders: [] });
    }

    const data = await upstream.json();

    // s-maxage: Vercel CDN serves cached response for 28s
    // stale-while-revalidate: can serve stale for extra 60s while refreshing
    res.setHeader('Cache-Control', 's-maxage=28, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, orders: [] });
  }
}
