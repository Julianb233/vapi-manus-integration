# Vapi-Manus Voice AI Integration

A complete voice AI agent platform that integrates [Vapi](https://vapi.ai)'s voice calling infrastructure with [Manus AI](https://manus.im)'s conversation intelligence to create powerful, intelligent phone agents.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## 🎯 Overview

This platform allows you to build and deploy AI-powered voice agents that can:

- 📞 **Handle phone calls** with natural conversation flow
- 🧠 **Generate intelligent responses** using Manus AI's LLM capabilities
- 💾 **Track conversation history** for analytics and improvement
- ⚙️ **Configure agent behavior** with custom prompts and settings
- 📊 **Monitor call metrics** including duration, status, and outcomes

## ✨ Features

### Agent Management
- Create multiple voice agents with unique personalities
- Configure system prompts to define agent behavior
- Set custom first messages for call greetings
- Enable/disable agents on demand

### Voice Integration
- Seamless webhook integration with Vapi
- Support for multiple voice providers (ElevenLabs, Deepgram, Azure)
- Real-time conversation processing
- Automatic call session tracking

### Conversation Intelligence
- Powered by Manus AI's LLM for context-aware responses
- Conversation history storage and retrieval
- Message-level tracking with timestamps
- End-of-call analytics

### Dashboard
- User-friendly interface for agent management
- Real-time call history viewing
- Conversation replay with message threading
- Agent configuration and webhook URL generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Vapi account ([sign up here](https://vapi.ai))
- MySQL/TiDB database (provided automatically in Manus deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Julianb233/vapi-manus-integration.git
   cd vapi-manus-integration
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The following environment variables are automatically configured when deployed on Manus:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `BUILT_IN_FORGE_API_KEY` - Manus AI API key
   - `BUILT_IN_FORGE_API_URL` - Manus AI API endpoint
   - OAuth configuration variables

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Create an Agent

1. Sign in to the dashboard
2. Click "Create Agent"
3. Configure your agent:
   - **Name**: Give your agent a descriptive name
   - **First Message**: What the agent says when answering
   - **System Prompt**: Instructions defining the agent's personality

Example system prompt:
```
You are a helpful customer support agent for Acme Corp. You are friendly, 
professional, and concise. Keep your responses brief and conversational, 
as this is a phone call. Ask clarifying questions when needed.
```

### Step 2: Connect to Vapi

1. After creating your agent, click "Configure"
2. Copy the webhook URL provided
3. In your Vapi dashboard, create or edit an assistant
4. Set the **Server URL** to your webhook URL
5. Enable these **Server Messages**:
   - `assistant-request` (required)
   - `conversation-update`
   - `assistant.started`
   - `end-of-call-report`

### Step 3: Start Making Calls

Your agent is now ready! When calls come in:
1. Vapi handles the voice infrastructure
2. Your webhook receives conversation events
3. Manus AI generates intelligent responses
4. Responses are spoken back to the caller
5. Everything is logged for later review

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│             │         │                  │         │             │
│  Vapi       │────────▶│  Your Webhook    │────────▶│  Manus AI   │
│  Platform   │         │  Server          │         │  LLM        │
│             │◀────────│  (This App)      │◀────────│             │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                          │
      │                          │
      ▼                          ▼
┌─────────────┐         ┌──────────────────┐
│  Phone      │         │  Database        │
│  Network    │         │  (Conversation   │
│             │         │   History)       │
└─────────────┘         └──────────────────┘
```

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4
- shadcn/ui components
- tRPC for type-safe API calls
- Wouter for routing

**Backend:**
- Node.js with Express
- tRPC 11 for API layer
- Drizzle ORM for database
- Manus AI LLM integration

**Database:**
- MySQL/TiDB
- Tables for users, agents, calls, messages, and webhook events

## 📁 Project Structure

```
vapi-manus-integration/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # tRPC client setup
│   └── public/            # Static assets
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # API routes and webhook handler
│   ├── db.ts              # Database queries
│   └── _core/             # Core framework code
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── VAPI_SETUP_GUIDE.md    # Detailed setup instructions
└── create-vapi-assistant.md # Scripts for creating Vapi assistants
```

## 🔧 Configuration

### Agent Configuration

Agents can be configured with:
- **Name**: Display name for the agent
- **First Message**: Opening greeting
- **System Prompt**: Behavioral instructions
- **Voice Settings**: Provider and voice ID (configured in Vapi)
- **Model**: LLM model selection (handled by Manus AI)

### Webhook Events

The webhook handles these Vapi events:
- `assistant.started` - Call begins, creates session
- `assistant-request` - Vapi requests AI response
- `conversation-update` - Message logged to database
- `end-of-call-report` - Call completes, saves metrics

## 📊 Database Schema

### Tables

- **users** - User accounts with Manus OAuth
- **vapi_agents** - Agent configurations
- **call_sessions** - Call metadata and status
- **conversation_messages** - Individual messages
- **webhook_events** - Raw webhook event log

## 🔐 Security

- OAuth authentication via Manus
- Session-based user management
- Webhook events logged for audit
- Database credentials managed by platform

## 🛠️ Development

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
pnpm build
```

### Database Migrations

```bash
# Generate migration
pnpm db:push

# View current schema
pnpm db:studio
```

## 📚 Documentation

- [Vapi Setup Guide](./VAPI_SETUP_GUIDE.md) - Complete integration walkthrough
- [Create Vapi Assistant](./create-vapi-assistant.md) - API scripts and examples
- [Vapi Documentation](https://docs.vapi.ai) - Official Vapi docs
- [Manus AI Documentation](https://docs.manus.im) - Manus platform docs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vapi](https://vapi.ai) for voice infrastructure
- [Manus AI](https://manus.im) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com) for UI components

## 📞 Support

For issues and questions:
- **Vapi Platform**: [Vapi Support](https://vapi.ai/support)
- **Manus Platform**: [Manus Help](https://help.manus.im)
- **This Integration**: [GitHub Issues](https://github.com/Julianb233/vapi-manus-integration/issues)

## 🚀 Deployment

This application is designed to be deployed on the Manus platform, which provides:
- Automatic environment configuration
- Database provisioning
- OAuth integration
- Public webhook URLs
- Monitoring and analytics

To deploy, simply push your code and use the Manus dashboard to publish your application.

---

Built with ❤️ using Vapi and Manus AI
