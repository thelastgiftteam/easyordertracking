export default async function handler(req, res) {
  const hqUrl = process.env.HQ_ENDPOINT;
  if (req.method === 'GET') {
    const params = new URLSearchParams(req.query).toString();
    const r = await fetch(`${hqUrl}?${params}`);
    const d = await res.json();
    return res.status(200).json(d);
  }
  if (req.method === 'POST') {
    const r = await fetch(hqUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const d = await r.json();
    return res.status(200).json(d);
  }
}
