export default async function handler(req, res) {
    const { userInput } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // This keeps your key hidden!

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Act as a Career Architect. Analyze this profile and give a 3-sentence career prediction: ${userInput}` }] }]
        })
    });

    const data = await response.json();
    res.status(200).json(data);
} 
