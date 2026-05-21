// ─────────────────────────────────────────────────────────────────────────────
// Gemini-powered tracking slip extractor
//
// Set GEMINI_API_KEY in Vercel → Project Settings → Environment Variables
// Get your key at: https://aistudio.google.com/app/apikey  (free to start)
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set',
      help:  'Add GEMINI_API_KEY to Vercel environment variables. Get key from https://aistudio.google.com/app/apikey',
    });
  }

  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const prompt = `You are analyzing an Indian courier/shipping tracking slip image.

Extract exactly these three fields:
- "name": The recipient's full name (remove titles like Mr/Mrs/Dr)
- "pincode": The 6-digit Indian PIN code of the delivery address
- "trackingId": The tracking / AWB / consignment number (alphanumeric, often starts with letters)

Rules:
- Return valid JSON only with keys: name, pincode, trackingId
- If a field is not clearly visible, return an empty string ""
- Do not include any explanation or extra text`;

  // Try endpoints in order — first working one wins
  const ENDPOINTS = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
  ];

  let geminiRes, lastErr;
  for (const url of ENDPOINTS) {
    try {
      geminiRes = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } },
            ],
          }],
          generationConfig: { temperature: 0 },
        }),
      });
      if (geminiRes.ok) break;
      lastErr = await geminiRes.text();
    } catch (e) {
      lastErr = e.message;
    }
  }

  if (!geminiRes || !geminiRes.ok) {
    const detail = typeof lastErr === 'string' ? lastErr.slice(0, 400) : JSON.stringify(lastErr).slice(0, 400);
    return res.status(500).json({ error: 'Gemini API error: ' + detail });
  }

  try {
    const data = await geminiRes.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return res.status(500).json({ error: 'Gemini returned no content', detail: data });
    }

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim();
    const result  = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      result: {
        name:       result.name       || '',
        pincode:    result.pincode    || '',
        trackingId: result.trackingId || '',
      },
    });
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Could not parse Gemini response', detail: err.message });
  }
}
