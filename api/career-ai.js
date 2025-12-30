export default async function handler(req, res) {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const userInput = body.userInput || "No input provided"; 
    
    // Line 10: This pulls from your Vercel Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // We use the v1 URL here for better stability with new keys
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile: ${userInput}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(data.error.code || 400).json(data.error);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
