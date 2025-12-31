export default async function handler(req, res) {
    // 1. Better CORS headers (allows your website to talk to your API)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
        const userMessage = body.message || body.userInput;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(200).json({ text: "Error: API key not set in Vercel." });

        // 2. FIXED ENDPOINT: Switching from 'gemini-pro' (buggy) to 'gemini-1.5-flash' (stable)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: `Act as a Career Advisor. For the user input: "${userMessage}", provide a 3-sentence career prediction and a 6-month roadmap.` }] 
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ text: `Google Error: ${data.error.message}` });
        }

        const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response found.";
        
        // 3. Send back both 'text' and 'response' so both versions of your code work
        res.status(200).json({ 
            text: cleanText,
            response: cleanText
        });

    } catch (error) {
        res.status(200).json({ text: "Server Connection Error: " + error.message });
    }
}
