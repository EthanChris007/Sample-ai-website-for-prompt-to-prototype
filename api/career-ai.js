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

        // TRY MODEL 1: Gemini 3 Flash (The new 2025 default)
        // TRY MODEL 2: Gemini 2.5 Flash (The stable fallback)
        const modelsToTry = ["gemini-3-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
        let finalResponse = null;
        let lastError = "";

        for (const modelName of modelsToTry) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `Act as a career coach. Give a 3-sentence roadmap for: ${userPrompt}` }] }]
                        })
                    }
                );
                const data = await response.json();
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    finalResponse = data.candidates[0].content.parts[0].text;
                    break; // Success! Stop trying other models.
                } else if (data.error) {
                    lastError = data.error.message;
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (finalResponse) {
            return res.status(200).json({ text: finalResponse, response: finalResponse });
        } else {
            return res.status(200).json({ text: `Google Refused all models. Last error: ${lastError}. (Hint: Check if Billing is enabled in AI Studio).` });
        }

    } catch (err) {
        return res.status(200).json({ text: "Critical System Error: " + err.message });
    }
}
