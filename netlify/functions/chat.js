const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages, max_tokens = 200, temperature = 0.8 } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'messages array required' }) };
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: Math.min(max_tokens, 500),
        temperature
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      return {
        statusCode: groqResponse.status,
        headers,
        body: JSON.stringify({ error: `Groq API error: ${groqResponse.status}`, details: errorData })
      };
    }

    const completion = await groqResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: completion.id,
        object: 'chat.completion',
        created: completion.created,
        model: completion.model,
        choices: completion.choices,
        usage: completion.usage
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
