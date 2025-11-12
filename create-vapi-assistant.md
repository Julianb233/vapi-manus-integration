# Create Vapi Assistant Script

This document provides ready-to-use scripts for creating Vapi assistants that connect to your Manus AI webhook.

## Prerequisites

1. Get your Vapi API key from https://dashboard.vapi.ai
2. Get your webhook URL from the agent configuration page in your dashboard
3. Choose your preferred method below

## Method 1: Using cURL (Command Line)

Replace the placeholders and run this command:

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My AI Agent",
    "firstMessage": "Hello! How can I help you today?",
    "voice": {
      "provider": "11labs",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    "model": {
      "provider": "openai",
      "model": "gpt-4"
    },
    "serverUrl": "YOUR_WEBHOOK_URL_HERE",
    "serverMessages": [
      "assistant-request",
      "conversation-update",
      "assistant.started",
      "end-of-call-report"
    ]
  }'
```

## Method 2: Using Node.js

Save this as `create-assistant.js`:

```javascript
const fetch = require('node-fetch');

const VAPI_API_KEY = 'YOUR_VAPI_API_KEY';
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';

async function createAssistant() {
  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'My AI Agent',
      firstMessage: 'Hello! How can I help you today?',
      voice: {
        provider: '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
      },
      serverUrl: WEBHOOK_URL,
      serverMessages: [
        'assistant-request',
        'conversation-update',
        'assistant.started',
        'end-of-call-report',
      ],
    }),
  });

  const data = await response.json();
  console.log('Assistant created:', data);
  return data;
}

createAssistant().catch(console.error);
```

Run with: `node create-assistant.js`

## Method 3: Using Python

Save this as `create_assistant.py`:

```python
import requests
import json

VAPI_API_KEY = 'YOUR_VAPI_API_KEY'
WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'

def create_assistant():
    url = 'https://api.vapi.ai/assistant'
    headers = {
        'Authorization': f'Bearer {VAPI_API_KEY}',
        'Content-Type': 'application/json',
    }
    data = {
        'name': 'My AI Agent',
        'firstMessage': 'Hello! How can I help you today?',
        'voice': {
            'provider': '11labs',
            'voiceId': '21m00Tcm4TlvDq8ikWAM',
        },
        'model': {
            'provider': 'openai',
            'model': 'gpt-4',
        },
        'serverUrl': WEBHOOK_URL,
        'serverMessages': [
            'assistant-request',
            'conversation-update',
            'assistant.started',
            'end-of-call-report',
        ],
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    result = response.json()
    print('Assistant created:', json.dumps(result, indent=2))
    return result

if __name__ == '__main__':
    create_assistant()
```

Run with: `python create_assistant.py`

## Voice Options

### ElevenLabs Voices
```json
{
  "provider": "11labs",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"  // Rachel - calm, professional
}
```

Popular ElevenLabs voice IDs:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (female, professional)
- `EXAVITQu4vr4xnSDxMaL` - Bella (female, friendly)
- `ErXwobaYiN019PkySvjV` - Antoni (male, professional)
- `VR6AewLTigWG4xSOukaG` - Arnold (male, authoritative)

### Deepgram Voices
```json
{
  "provider": "deepgram",
  "voiceId": "aura-asteria-en"
}
```

Popular Deepgram voice IDs:
- `aura-asteria-en` - Female, professional
- `aura-luna-en` - Female, warm
- `aura-stella-en` - Female, energetic
- `aura-athena-en` - Female, confident
- `aura-hera-en` - Female, authoritative
- `aura-orion-en` - Male, professional
- `aura-arcas-en` - Male, friendly
- `aura-perseus-en` - Male, confident
- `aura-angus-en` - Male, warm
- `aura-orpheus-en` - Male, authoritative
- `aura-helios-en` - Male, energetic
- `aura-zeus-en` - Male, powerful

### Azure Voices
```json
{
  "provider": "azure",
  "voiceId": "en-US-JennyNeural"
}
```

## Model Options

### OpenAI Models
```json
{
  "provider": "openai",
  "model": "gpt-4"  // or "gpt-3.5-turbo"
}
```

### Anthropic Models
```json
{
  "provider": "anthropic",
  "model": "claude-3-opus-20240229"  // or "claude-3-sonnet-20240229"
}
```

## Important Notes

1. **serverUrl is required**: This connects your Vapi assistant to your Manus AI webhook
2. **serverMessages must include "assistant-request"**: This is how Vapi asks your webhook for responses
3. **Save the assistant ID**: The response will include an `id` field - save this for future reference
4. **Test your assistant**: Use the Vapi dashboard to make test calls

## Troubleshooting

- **401 Unauthorized**: Check your Vapi API key
- **400 Bad Request**: Verify your JSON syntax and required fields
- **Webhook not receiving events**: Ensure serverUrl is publicly accessible
- **No responses from agent**: Verify "assistant-request" is in serverMessages

## Next Steps

After creating your assistant:
1. Note the assistant ID from the response
2. Go to your Vapi dashboard to see the assistant
3. Make a test call to verify the integration
4. Check your Vapi-Manus dashboard for call history
