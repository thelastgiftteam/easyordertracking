// pages/api/revalidate.js
// Called by Customer Template Script → "Update Website" menu item.
// Immediately clears the ISR cache for /{code} so admin config
// changes (brand name, bottom bar, etc.) appear within seconds.
//
// Usage: GET /api/revalidate?secret=xxx&code=728192

export default async function handler(req, res) {
  const { secret, code } = req.query;

  // Guard with secret to prevent abuse
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ revalidated: false, message: 'Invalid secret' });
  }

  if (!code) {
    return res.status(400).json({ revalidated: false, message: 'Missing code' });
  }

  try {
    await res.revalidate(`/${code}`);
    return res.json({ revalidated: true, code, ts: Date.now() });
  } catch (e) {
    return res.status(500).json({ revalidated: false, message: e.message });
  }
}
