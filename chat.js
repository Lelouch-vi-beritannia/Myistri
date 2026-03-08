// Groq API Key (langsung di-hardcode)
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, max_tokens = 150, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    console.log('Receiving request with', messages.length, 'messages');

    // Call Groq API directly with fetch
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: messages,
        max_tokens: Math.min(max_tokens, 500),
        temperature: temperature
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorData);
      return res.status(groqResponse.status).json({
        error: `Groq API error: ${groqResponse.status}`,
        details: errorData
      });
    }

    const completion = await groqResponse.json();
    console.log('Got response from Groq');

    // Return in OpenAI format
    return res.status(200).json({
      id: completion.id,
      object: 'chat.completion',
      created: completion.created,
      model: completion.model,
      choices: completion.choices,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

