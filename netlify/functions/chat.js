const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Simple in-memory user store (persists during function warm state)
// For production use a real DB like FaunaDB or Supabase
const USERS_KEY = 'cwa_users';

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

// ─── AUTH handlers ───────────────────────────────────────────────
function handleRegister(body) {
  const { username, password } = body;
  if (!username || !password) return respond(400, { error: 'Username dan password wajib' });
  if (username.length < 3) return respond(400, { error: 'Username minimal 3 karakter' });
  if (password.length < 4) return respond(400, { error: 'Password minimal 4 karakter' });
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return respond(400, { error: 'Username hanya huruf, angka, underscore' });

  // Use process.env as ephemeral store fallback (not persistent, just for demo)
  // In real deployment, connect to Supabase/FaunaDB
  return respond(200, { ok: true, message: 'Akun berhasil dibuat!' });
}

// ─── CHAT handler ────────────────────────────────────────────────
async function handleChat(body) {
  const { messages, max_tokens = 200, temperature = 0.8 } = body;

  if (!messages || !Array.isArray(messages)) {
    return respond(400, { error: 'messages array required' });
  }

  const groqRes = await fetch(GROQ_API_URL, {
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

  if (!groqRes.ok) {
    const err = await groqRes.text();
    console.error('Groq error:', groqRes.status, err);
    return respond(groqRes.status, { error: `Groq error: ${groqRes.status}`, details: err });
  }

  const data = await groqRes.json();
  return respond(200, {
    id: data.id,
    object: 'chat.completion',
    created: data.created,
    model: data.model,
    choices: data.choices,
    usage: data.usage
  });
}

// ─── MAIN HANDLER ────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON' });
  }

  const action = body.action || 'chat';

  try {
    if (action === 'chat') return await handleChat(body);
    if (action === 'register') return handleRegister(body);
    return respond(400, { error: 'Unknown action' });
  } catch (err) {
    console.error('Handler error:', err);
    return respond(500, { error: err.message || 'Internal server error' });
  }
};
