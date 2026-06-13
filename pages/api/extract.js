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

  const prompt = `You are an OCR extraction engine for Indian courier and postal documents.

Extract:
- name = recipient/consignee/receiver name only
- pincode = destination 6-digit PIN code
- trackingId = tracking/AWB/consignment/article number

Rules:
- Works for any courier (India Post, DTDC, Delhivery, Blue Dart, XpressBees, etc.).
- Always use receiver details, never sender details.
- If multiple shipments are present, return an array with one object per shipment.
- Match name, pincode, and trackingId from the same shipment row/label.
- If a value is unclear, return "".
- For India Post / Speed Post slips: the tracking number is labeled "Article No." or "Article Number" and follows the format XX999999999IN (2 letters + 9 digits + IN). It is usually printed above or below a barcode.
- For pincode: look inside the full "To" address block — it is the 6-digit number, often after the city name like "Ernakulam - 682006".
- If the image contains a barcode, the alphanumeric string printed directly below or beside it is the tracking number.
- Ignore any sender/from details entirely.
Return JSON only.

Single shipment:
{
  "name": "",
  "pincode": "",
  "trackingId": ""
}

Multiple shipments:
[
  {
    "name": "",
    "pincode": "",
    "trackingId": ""
  }
]`;

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
