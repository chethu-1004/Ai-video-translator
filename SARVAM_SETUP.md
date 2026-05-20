# Sarvam AI API Setup Guide

## Overview

This application uses **Sarvam AI** - a hosted API solution for Indian language processing:

- **Speech-to-Text-Translate**: Automatic transcription and translation
- **Text-to-Speech**: Natural-sounding voice synthesis
- **22 Indian languages** supported
- **No local GPU required** - runs entirely on cloud infrastructure
- **Free tier available** - get started without payment
- **Production-ready** - enterprise-grade reliability

This guide covers setting up your Sarvam AI API key and configuration.

---

## Getting Your Sarvam AI API Key

### Step 1: Sign Up for Sarvam AI

1. Visit the Sarvam AI Dashboard: **https://dashboard.sarvam.ai/**
2. Click on **"Sign Up"** or **"Get Started"**
3. Sign up using:
   - Google account, or
   - Email and password
4. Verify your email address if required

### Step 2: Generate API Key

1. Log in to the Sarvam AI Dashboard
2. Navigate to the **"API Keys"** section (usually in the sidebar or settings)
3. Click **"Create New API Key"** or **"Generate API Key"**
4. Give your key a descriptive name (e.g., "Video Translator App")
5. Copy the generated API key immediately (you won't be able to see it again)

### Step 3: Configure Your Application

1. Open your backend `.env` file:
   ```bash
   cd backend
   nano .env  # or use your preferred editor
   ```

2. Add your API key:
   ```env
   SARVAM_API_KEY=your_actual_api_key_here
   SARVAM_API_URL=https://api.sarvam.ai
   ```

3. Save the file and restart your backend server

---

## API Pricing & Limits

### Free Tier
- **Speech-to-Text**: Limited free requests per month
- **Translation**: Limited free characters per month
- **Text-to-Speech**: Limited free characters per month

Check the latest pricing at: **https://docs.sarvam.ai/api-reference-docs/getting-started/pricing**

### Rate Limits
- Standard tier: 60 requests per minute
- Higher tiers available for enterprise users

---

## Supported Languages

Sarvam AI supports **22 Indian languages** plus English:

| Language Code | Language |
|--------------|----------|
| hi-IN | Hindi |
| kn-IN | Kannada |
| te-IN | Telugu |
| ta-IN | Tamil |
| ml-IN | Malayalam |
| bn-IN | Bengali |
| gu-IN | Gujarati |
| mr-IN | Marathi |
| od-IN | Odia |
| pa-IN | Punjabi |
| as-IN | Assamese |
| en-IN | English |

---

## API Endpoints Used

The application uses the following Sarvam AI endpoints:

### 1. Speech-to-Text-Translate
**Endpoint**: `POST /speech-to-text-translate`

Combines speech recognition and translation in a single API call:
- Uploads audio chunk
- Automatically detects source language
- Returns transcribed text and translated text
- Supports 22 Indian languages

### 2. Text-to-Speech
**Endpoint**: `POST /text-to-speech`

Converts translated text to natural-sounding speech:
- Multiple speaker voices available
- Adjustable pitch, pace, and loudness
- High-quality audio output

### 3. Translate (Fallback)
**Endpoint**: `POST /translate`

Text-only translation if needed:
- Supports 22 Indian languages
- Context-aware translation

---

## Testing Your API Key

### Using cURL

```bash
# Test API key
export SARVAM_API_KEY="your_api_key_here"

# Test language detection
curl -X POST https://api.sarvam.ai/detect-language \
  -H "API-Subscription-Key: $SARVAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते भारत"}'

# Test translation
curl -X POST https://api.sarvam.ai/translate \
  -H "API-Subscription-Key: $SARVAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello, how are you?",
    "source_language_code": "en-IN",
    "target_language_code": "hi-IN"
  }'
```

### Using Python

```python
import requests

api_key = "your_api_key_here"
headers = {
    "API-Subscription-Key": api_key,
    "Content-Type": "application/json"
}

# Test translation
response = requests.post(
    "https://api.sarvam.ai/translate",
    headers=headers,
    json={
        "input": "Hello, how are you?",
        "source_language_code": "en-IN",
        "target_language_code": "hi-IN"
    }
)

print(response.json())
```

---

## Troubleshooting

### API Key Not Working

1. **Check the key is correct**: Ensure you've copied the entire key without spaces
2. **Verify the header name**: Must be `API-Subscription-Key` (case-sensitive)
3. **Check key status**: Ensure the key is active in your dashboard
4. **Check rate limits**: You may have exceeded your quota

### Authentication Errors

```json
{
  "error": "Invalid API key"
}
```

**Solution**: 
- Verify your API key in the dashboard
- Ensure you're using the correct header: `API-Subscription-Key`
- Check that your key hasn't been revoked or expired

### Rate Limit Errors

```json
{
  "error": "Rate limit exceeded"
}
```

**Solution**:
- Wait a few seconds before retrying
- Implement exponential backoff in your code
- Consider upgrading your plan for higher limits

### Language Not Supported

```json
{
  "error": "Unsupported language code"
}
```

**Solution**:
- Use the correct language code format (e.g., `hi-IN` not just `hi`)
- Check the supported languages list above

---

## Security Best Practices

1. **Never commit your API key**: Always use environment variables
2. **Use .env files**: Included in .gitignore
3. **Rotate keys periodically**: Generate new keys every few months
4. **Monitor usage**: Check your dashboard for unexpected activity
5. **Set up alerts**: Configure usage alerts in the dashboard

---

## Support & Resources

- **Sarvam AI Documentation**: https://docs.sarvam.ai/
- **API Reference**: https://docs.sarvam.ai/api-reference-docs/introduction
- **Dashboard**: https://dashboard.sarvam.ai/
- **Discord Community**: https://discord.com/invite/5rAsykttcs

---

## Next Steps

After setting up your API key:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Visit http://localhost:5173 and try translating a video!

For any issues, check the logs in your terminal for detailed error messages.
