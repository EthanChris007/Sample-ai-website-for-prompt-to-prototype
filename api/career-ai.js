export default async function handler(req, res) {
    // Add this line to handle the 'undefined' error
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { userInput } = body;
    
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile and give a 3-sentence career prediction and a 6-month roadmap: ${userInput}` }] }]
        })
    });

    const data = await response.json();
    res.status(200).json(data);
}
