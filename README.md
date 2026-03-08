# WaifuChat - Groq API Proxy

Proxy server untuk forward requests dari WaifuChat ke Groq API via Vercel.

## 📋 Requirements

- Groq API account (https://console.groq.com)
- Groq API key
- Vercel account (https://vercel.com)
- GitHub account (optional but recommended)

## 🚀 Quick Start

### 1. Get Groq API Key

1. Go to https://console.groq.com
2. Click "Manage Workspace" → "Settings" → "API Keys"
3. Create new API key
4. Copy the key (starts with `gsk_`)

### 2. Deploy to Vercel

#### Option A: Using GitHub (Recommended)

1. Create GitHub repo with these files:
   - `api/chat.js`
   - `package.json`
   - `.env.example`

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Click "Environment Variables"
6. Add:
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key
7. Click "Deploy"

#### Option B: Direct Upload

1. Go to https://vercel.com/new
2. Create project with these files
3. Add environment variable `GROQ_API_KEY`
4. Deploy

### 3. Update WaifuChat

Get your Vercel project URL (e.g., `https://waifuchat-api.vercel.app`)

Update WaifuChat code to use your endpoint:

In `callG()` function, replace proxy URLs:

```javascript
var r = await fetchT('https://YOUR_VERCEL_URL/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: systemPrompt.slice(0, 700) },
      { role: 'user', content: userMsg }
    ],
    max_tokens: 150,
    temperature: 0.7
  })
}, 20000);
```

## ✅ Testing

Test your endpoint:

```bash
curl -X POST https://YOUR_VERCEL_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

## 📊 Groq API Limits

- Free tier: 9000 requests/day
- Models: mixtral-8x7b-32768, llama-3.1-70b, etc
- Response time: Very fast (~100ms)

## 🔒 Security

- API key stored as Vercel environment variable
- Never commit `.env` file
- Use `.env.example` to show what variables needed

## 📝 Notes

- Max 500 tokens per request (configured in code)
- Adjust as needed
- Monitor usage at https://console.groq.com

## 🆘 Troubleshooting

### 500 Error
- Check Groq API key is correct
- Check API key in Vercel environment variables
- Check request format

### CORS Error
- Should be handled by CORS headers in code
- If still issue, verify headers are correct

### Rate Limited
- You've hit 9000 requests/day limit
- Wait until next day
- Or upgrade Groq plan

## 📞 Support

- Groq Docs: https://console.groq.com/docs
- Vercel Docs: https://vercel.com/docs
