export default async function handler(req, res) {
  const hqUrl = process.env.HQ_ENDPOINT;
  if (!hqUrl) return res.status(500).json({ error: 'HQ_ENDPOINT not configured' });

  try {
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query).toString();
      const r = await fetch(`${hqUrl}?${params}`, { redirect: 'follow' });
      const text = await r.text();
      try {
        return res.status(200).json(JSON.parse(text));
      } catch {
        return res.status(200).send(text);
      }
    }
    if (req.method === 'POST') {
      const r = await fetch(hqUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(req.body),
        redirect: 'follow',
      });
      const text = await r.text();
      try {
        return res.status(200).json(JSON.parse(text));
      } catch {
        return res.status(200).send(text);
      }
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
