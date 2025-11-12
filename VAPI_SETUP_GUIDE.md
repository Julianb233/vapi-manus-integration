# Vapi-Manus Voice AI Integration Setup Guide

This guide will walk you through setting up a complete voice AI agent that integrates Vapi's voice calling platform with Manus AI's conversation intelligence.

## Overview

The Vapi-Manus integration allows you to create intelligent voice agents that can:
- Handle phone calls with natural conversation
- Use Manus AI for context-aware responses
- Track conversation history and analytics
- Configure custom agent behaviors and prompts

## Architecture

The integration works as follows:

1. **Vapi** handles the voice infrastructure (speech-to-text, text-to-speech, phone calls)
2. **Your webhook server** receives conversation events from Vapi
3. **Manus AI** processes the conversation and generates intelligent responses
4. **Database** stores conversation history, call sessions, and agent configurations

## Prerequisites

- A Vapi account (sign up at https://vapi.ai)
- Your Vapi API key (get it from https://dashboard.vapi.ai)
- This deployed application with a public webhook URL

## Step 1: Create an Agent in the Dashboard

1. Sign in to your Vapi-Manus Integration dashboard
2. Click "Create Agent"
3. Configure your agent:
   - **Name**: Give your agent a descriptive name (e.g., "Customer Support Agent")
   - **First Message**: What the agent says when answering (e.g., "Hello! How can I help you today?")
   - **System Prompt**: Instructions that define the agent's personality and behavior

Example system prompt:
```
You are a helpful customer support agent for Acme Corp. You are friendly, professional, and concise. 
You can help customers with:
- Product information
- Order status
- Technical support
- General inquiries

Keep your responses brief and conversational, as this is a phone call. Ask clarifying questions when needed.
```

4. Click "Create Agent"

## Step 2: Get Your Webhook URL

1. After creating your agent, click "Configure" on the agent card
2. Scroll down to the "Vapi Integration" section
3. Copy the webhook URL (it will look like: `https://your-domain.com/api/trpc/webhook.vapi`)

## Step 3: Create a Vapi Assistant

Now you'll create a Vapi assistant that connects to your Manus-powered agent.

### Option A: Using the Vapi Dashboard

1. Go to https://dashboard.vapi.ai
2. Click "Create Assistant"
3. Configure the basic settings:
   - **Name**: Same as your agent name
   - **First Message**: Same as your agent's first message
   - **Voice**: Choose a voice provider and voice ID (e.g., ElevenLabs, Deepgram)

4. **Important**: In the "Server" section:
   - Set **Server URL** to your webhook URL from Step 2
   - Enable these **Server Messages**:
     - `assistant-request` (REQUIRED - this is how Vapi asks for responses)
     - `conversation-update` (for tracking messages)
     - `assistant.started` (for call start tracking)
     - `end-of-call-report` (for call completion tracking)

5. Save your assistant

### Option B: Using the Vapi API

You can also create an assistant programmatically:

```bash
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Agent",
    "firstMessage": "Hello! How can I help you today?",
    "voice": {
      "provider": "11labs",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    "model": {
      "provider": "openai",
      "model": "gpt-4"
    },
    "serverUrl": "https://your-domain.com/api/trpc/webhook.vapi",
    "serverMessages": [
      "assistant-request",
      "conversation-update",
      "assistant.started",
      "end-of-call-report"
    ]
  }'
```

## Step 4: Test Your Agent

### Making a Test Call

1. In your Vapi dashboard, find your assistant
2. Click "Test" or use the phone number provided
3. Make a call and have a conversation
4. Your Manus AI agent will respond intelligently to the conversation

### Viewing Call History

1. Go back to your Vapi-Manus Integration dashboard
2. Click "Calls" on your agent card
3. You'll see all call sessions with:
   - Phone number
   - Start time and duration
   - Call status and end reason
4. Click "View Conversation" to see the full message history

## Understanding the Webhook Flow

Here's what happens during a call:

1. **Call Starts** (`assistant.started` event)
   - Vapi sends a webhook to your server
   - A call session is created in your database

2. **User Speaks** (`assistant-request` event)
   - Vapi transcribes the user's speech
   - Sends the conversation history to your webhook
   - Your server processes it with Manus AI
   - Returns an intelligent response
   - Vapi speaks the response to the user

3. **Conversation Updates** (`conversation-update` event)
   - Each message is logged to your database
   - You can view the full conversation later

4. **Call Ends** (`end-of-call-report` event)
   - Final call metrics are saved
   - Duration, end reason, and status are recorded

## Advanced Configuration

### Custom System Prompts

You can customize your agent's behavior by editing the system prompt. Some examples:

**Sales Agent:**
```
You are an enthusiastic sales representative for TechCo. Your goal is to understand the customer's needs 
and recommend the best product. Be persuasive but not pushy. Ask qualifying questions to understand their 
budget and requirements.
```

**Appointment Scheduler:**
```
You are an appointment scheduling assistant for Dr. Smith's dental office. You can:
- Check available appointment slots
- Book new appointments
- Reschedule existing appointments
- Answer questions about office hours and location

Always confirm the appointment details before finalizing.
```

### Voice Settings

In your Vapi assistant configuration, you can customize:
- **Voice Provider**: ElevenLabs, Deepgram, Azure, etc.
- **Voice ID**: Choose different voice personalities
- **Speed**: Adjust speaking rate
- **Stability**: Control voice consistency

### Handling Multiple Agents

You can create multiple agents for different purposes:
- Customer support agent
- Sales agent
- Appointment scheduler
- Technical support agent

Each agent can have its own:
- System prompt and personality
- First message
- Vapi assistant configuration
- Call history tracking

## Troubleshooting

### Agent Not Responding

1. **Check webhook URL**: Make sure the serverUrl in Vapi matches your webhook URL exactly
2. **Verify server messages**: Ensure `assistant-request` is enabled in your Vapi assistant
3. **Check logs**: Look at the webhook events in your database for error messages

### Calls Not Appearing in History

1. **Verify events**: Make sure these events are enabled:
   - `assistant.started`
   - `conversation-update`
   - `end-of-call-report`
2. **Check database**: Ensure your database connection is working

### Poor Response Quality

1. **Improve system prompt**: Add more specific instructions and examples
2. **Add context**: Include relevant information in the system prompt
3. **Test different prompts**: Iterate on the prompt to improve responses

## API Reference

### Webhook Endpoint

**URL**: `POST /api/trpc/webhook.vapi`

**Request Body**: Vapi server message (varies by event type)

**Response** (for `assistant-request` events):
```json
{
  "messageResponse": {
    "message": "The AI-generated response text"
  }
}
```

### Supported Event Types

- `assistant.started` - Call begins
- `assistant-request` - Vapi requests a response
- `conversation-update` - Message exchanged
- `end-of-call-report` - Call completes

## Best Practices

1. **Keep responses concise**: Phone conversations work best with brief, clear responses
2. **Use natural language**: Write system prompts as if talking to a person
3. **Test thoroughly**: Make test calls before going live
4. **Monitor conversations**: Review call history to improve your prompts
5. **Handle errors gracefully**: Include fallback responses in your system prompt
6. **Set expectations**: Tell users what the agent can and cannot do

## Security Considerations

1. **Webhook authentication**: Consider adding authentication to your webhook endpoint
2. **Data privacy**: Be mindful of sensitive information in conversations
3. **Rate limiting**: Implement rate limiting to prevent abuse
4. **Logging**: Monitor webhook events for suspicious activity

## Next Steps

- Explore the call history to see how your agent performs
- Iterate on your system prompts to improve responses
- Create multiple agents for different use cases
- Integrate with your existing systems using the tRPC API

## Support

For issues with:
- **Vapi platform**: Contact Vapi support at https://vapi.ai/support
- **This integration**: Check the application logs and webhook events
- **Manus AI**: Refer to Manus AI documentation

## Resources

- Vapi Documentation: https://docs.vapi.ai
- Vapi API Reference: https://docs.vapi.ai/api-reference
- Vapi Community: https://vapi.ai/community
