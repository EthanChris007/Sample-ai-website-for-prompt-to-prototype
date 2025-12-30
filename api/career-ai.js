export default async function handler(req, res) {
    // 1. Parse the user input correctly
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const userInput = body.userInput || "No input provided"; 
    
    // 2. Get the API key you saved in Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 3. Use the v1 URL (more stable)
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}', {            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile and give a 3-sentence career prediction and a 6-month roadmap: ${userInput}` }] }]
            })
        });

        const data = await response.json();
        
        // 4. Handle errors from Google
        if (data.error) {
            return res.status(data.error.code || 400).json(data.error);
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}     
