export default async function handler(req, res) {
    // Standard Vercel Headers for security/access
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Claude's safety check for the request method
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
        const apiKey = process.env.GEMINI_API_KEY;

        // Claude's check for the API Key
        if (!apiKey) {
            return res.status(200).json({ text: "Error: API Key is missing in Vercel settings." });
        }

        // Using Gemini 1.5 Flash (The most stable free-tier model)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: `Act as a Career Architect. Based on this input: "${body.message || body.userInput}", give a 3-sentence career prediction and a 6-month roadmap.` }] 
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        const data = await response.json();

        // Check for the "Quota Exceeded" error we saw earlier
        if (data.error) {
            return res.status(200).json({ 
                text: `Google says: ${data.error.message}. (Tip: If it says 'Quota Exceeded', try again in 30 seconds).` 
            });
        }

        // Cleanly extract the AI's text
        const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "The AI didn't provide a response. Try again!";
        
        // Sending back 'text' so your frontend can display it immediately
        res.status(200).json({ text: cleanText });

    } catch (error) {
        res.status(500).json({ text: "Server error: " + error.message });
    }
}
