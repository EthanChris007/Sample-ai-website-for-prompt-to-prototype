export default async function handler(req, res) {
    // 1. This "Safety Net" fixes the 'undefined' error you saw in the logs
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const userInput = body.userInput || "No input provided"; 
    
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile and give a 3-sentence career prediction and a 6-month roadmap: ${userInput}` }] }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "AI failed to respond", details: error.message });
    }
}
