// ─────────────────────────────────────────────────────────────────────────────
// Gemini-powered tracking slip extractor
// Handles both single slips AND bulk booking receipts (multiple rows in one image)
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
      help:  'Add GEMINI_API_KEY to Vercel environment variables.',
    });
  }

  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const prompt = `You are an OCR extraction engine for Indian courier and postal documents.

This image may be:
- A single tracking slip / courier label
- A bulk booking receipt / manifest with a TABLE of multiple shipments (common from India Post counters)

For EACH shipment in the image, extract:
- name: recipient / consignee / receiver name only (not sender)
- pincode: destination 6-digit PIN code (labeled "Dest. Pin-code", "PIN", or inside the address)
- trackingId: the article/tracking/AWB/consignment number (for India Post it looks like CL524765347IN or EL123456789IN)

Rules:
- Always use RECEIVER details, never sender details.
- For bulk receipts with a table: extract ALL rows from the table as an array.
- Match name, pincode, and trackingId from the same row/shipment.
- For India Post bulk receipts: Article Number column = trackingId, Receiver Details column = name, Dest. Pin-code column = pincode.
- Clean up names that are split across lines (e.g. "JEFFRY BIJU SEBAST- IAN" should be "Jeffry Biju Sebastian").
- If a value is unclear, return empty string "".

Return ONLY a JSON array — even for a single shipment:
[
  { "name": "", "pincode": "", "trackingId": "" }
]`;

  const ENDPOINTS = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    return res.status(500).json({ error: 'Gemini API error', detail: String(lastErr).slice(0, 400) });
  }

  try {
    const data = await geminiRes.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return res.status(500).json({ error: 'Gemini returned no content', detail: data });
    }

    // Strip markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed  = JSON.parse(cleaned);

    // Always normalise to array
    const rows = Array.isArray(parsed) ? parsed : [parsed];

    const results = rows
      .filter(r => r.name || r.trackingId) // skip blank rows
      .map(r => ({
        name:       String(r.name       || '').trim(),
        pincode:    String(r.pincode    || '').trim(),
        trackingId: String(r.trackingId || '').trim(),
      }));

    return res.status(200).json({ success: true, results });

  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Could not parse Gemini response', detail: err.message });
  }
}
