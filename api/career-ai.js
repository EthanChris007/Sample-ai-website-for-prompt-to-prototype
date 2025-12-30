export default async function handler(req, res) {
    // FIXED ALL SPELLING ERRORS HERE
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // This is the absolute most stable URL for Gemini 1.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Act as a Career Architect. Give a 3-sentence career prediction and a 6-month roadmap for: ${body.userInput}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(200).json({ text: `Google API Error: ${data.error.message}` });
        }

        const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI response empty. Check API Key permissions.";
        res.status(200).json({ text: cleanText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
