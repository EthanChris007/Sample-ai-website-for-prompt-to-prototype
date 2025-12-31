export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userInput, conversationHistory } = req.body;
    
    // Accept either 'message' or 'userInput'
    const userMessage = message || userInput;
    if (!userMessage) {
      return res.status(400).json({ error: 'Message or userInput is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build contents array with conversation history
    const contents = [];
    
    // Add system instruction as first message (instead of systemInstruction field)
    contents.push({
      role: 'user',
      parts: [{ text: "You are a helpful career advisor. Provide practical, actionable career advice. Be encouraging but realistic. Help users with resume tips, interview preparation, career transitions, and professional development." }]
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: "I understand. I'm here to help with career guidance and advice." }]
    });

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Call Gemini 1.5 Flash API (generous free tier!)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          details: data.error?.message 
        });
      }
      
      return res.status(response.status).json({ 
        error: data.error?.message || 'API request failed',
        details: data
      });
    }

    // Extract the response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({ 
        error: 'No response from AI',
        details: data 
      });
    }

    return res.status(200).json({ 
      response: aiResponse,
      text: aiResponse,
      model: "gemini-1.5-flash"
    });

  } catch (error) {
    console.error('Server Error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
} 
