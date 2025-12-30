export default async function handler(req, res) {
    // 1. Add CORS headers so your GitHub site can talk to Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle the preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const userInput = body.userInput || "No input provided"; 
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 2. Updated to v1beta to fix the "model not found" error
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile and give a 3-sentence career prediction and a 6-month roadmap: ${userInput}` }] }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(data.error.code || 400).json(data.error);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
