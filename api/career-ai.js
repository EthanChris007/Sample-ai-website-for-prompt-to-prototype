export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
        const userPrompt = body.userInput || body.message || "I need career advice";
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(200).json({ text: "Error: No API Key found in Vercel." });

        // 1. STABLE 2025 ENDPOINT
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Act as a career coach. Suggest a 3-sentence path for: ${userPrompt}` }] }]
                })
            }
        );

        const data = await response.json();

        // 2. DEEP LOGGING (If it fails, it tells you WHY)
        if (data.error) {
            const reason = data.error.message || "Unknown Google Error";
            const code = data.error.code || "No Code";
            return res.status(200).json({ text: `Google Refused: [${code}] ${reason}` });
        }

        // 3. CAREFUL EXTRACTION
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            return res.status(200).json({ text: "Google returned an empty response. This usually means the prompt was blocked by safety filters." });
        }

        // 4. SUCCESS
        return res.status(200).json({ text: aiText, response: aiText });

    } catch (err) {
        return res.status(200).json({ text: "Connection Failed: " + err.message });
    }
}
