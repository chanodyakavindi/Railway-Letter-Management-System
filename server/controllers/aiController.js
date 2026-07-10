const OpenAI = require('openai');
const { createAuditLog } = require('../utils/audit');

let client = null;
function getClient() {
  if (client) return client;
  if (!process.env.OPENAI_API_KEY) return null;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are a meticulous document-understanding assistant for the Sri Lanka Railways Letter Management System. You read scanned/photographed incoming letters that may be HANDWRITTEN or printed, in SINHALA and/or ENGLISH, and extract key registration fields. Be careful with Sinhala handwriting. Never invent data: if a field is not present or not legible, return an empty string. Always respond with a single JSON object only.`;

const USER_PROMPT = `Extract the following fields from this letter and return JSON with EXACTLY these keys:
{
  "letterNumber": "the sender's reference/letter number exactly as written, else ''",
  "letterDate": "the date written on the letter in YYYY-MM-DD format, else ''",
  "dateReceived": "any received/stamped date in YYYY-MM-DD format, else ''",
  "referredEntity": "the sending organisation or person (the sender/from), else ''",
  "subject": "the subject/re line of the letter in its original language, else a short title summarising it",
  "fileNumber": "any internal file number referenced, else ''",
  "language": "si if mainly Sinhala, en if mainly English, mixed if both",
  "confidence": "high | medium | low based on legibility"
}
Return ONLY the JSON object, no markdown, no commentary.`;

exports.extractLetter = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ai = getClient();
    if (!ai) {
      return res.status(503).json({
        message:
          'AI extraction is not configured. Add OPENAI_API_KEY to server/.env and restart the server.',
      });
    }

    const mime = req.file.mimetype;
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    const contentPart = mime === 'application/pdf'
      ? { type: 'file', file: { filename: req.file.originalname || 'letter.pdf', file_data: dataUrl } }
      : { type: 'image_url', image_url: { url: dataUrl } };

    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [{ type: 'text', text: USER_PROMPT }, contentPart] },
      ],
    });

    let fields = {};
    try {
      fields = JSON.parse(completion.choices[0].message.content || '{}');
    } catch (e) {
      return res.status(502).json({ message: 'AI returned an unreadable response. Please try again.' });
    }

    const result = {
      letterNumber: fields.letterNumber || '',
      letterDate: fields.letterDate || '',
      dateReceived: fields.dateReceived || '',
      referredEntity: fields.referredEntity || '',
      subject: fields.subject || '',
      fileNumber: fields.fileNumber || '',
      language: fields.language || '',
      confidence: fields.confidence || '',
    };

    await createAuditLog({
      user: req.user,
      action: 'AI extracted letter fields',
      details: `Scanned ${req.file.originalname || mime} (${result.language || 'unknown'}, ${result.confidence || 'n/a'} confidence)`,
      req,
    });

    res.json(result);
  } catch (err) {
    if (err.status === 401) {
      return res.status(503).json({ message: 'AI extraction failed: invalid OpenAI API key.' });
    }
    if (err.status === 429) {
      return res.status(503).json({ message: 'AI extraction is rate-limited or out of quota. Try again later.' });
    }
    console.error('AI extraction error:', err.message);
    return res.status(502).json({ message: 'AI extraction failed: ' + (err.message || 'unknown error') });
  }
};
