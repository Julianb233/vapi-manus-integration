# Deploying to Vercel

This guide will walk you through deploying your Vapi-Manus Voice AI Integration to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A MySQL database (we recommend [PlanetScale](https://planetscale.com/) or [Neon](https://neon.tech/) for serverless compatibility)
3. An [OpenAI API key](https://platform.openai.com/api-keys) OR [Manus AI API key](https://manus.im)
4. A [Vapi account](https://vapi.ai) for voice infrastructure

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Julianb233/Ian-Duffy-Vapi-Agent)

## Manual Deployment Steps

### 1. Prepare Your Database

You'll need a MySQL-compatible database. We recommend using PlanetScale or Neon for Vercel deployments:

#### Option A: PlanetScale (Recommended)

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection string from the dashboard
4. Format: `mysql://user:password@host/database?sslaccept=strict`

#### Option B: Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string
4. Format: `mysql://user:password@host/database`

### 2. Fork or Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Julianb233/Ian-Duffy-Vapi-Agent.git
cd Ian-Duffy-Vapi-Agent

# Or fork it on GitHub and clone your fork
```

### 3. Install Vercel CLI (Optional)

For local testing:

```bash
npm i -g vercel
```

### 4. Configure Environment Variables

Create a `.env.local` file for local testing (DO NOT commit this file):

```bash
# Database
DATABASE_URL=mysql://user:password@host/database

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# AI Provider - Choose ONE:
# Option 1: OpenAI (Recommended for Vercel)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Option 2: Manus AI
BUILT_IN_FORGE_API_KEY=your-manus-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im

# Node Environment
NODE_ENV=production
```

### 5. Deploy to Vercel

#### Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

5. Add Environment Variables in Vercel dashboard:
   - `DATABASE_URL` - Your MySQL connection string
   - `JWT_SECRET` - A secure random string (min 32 characters)
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NODE_ENV` - Set to `production`

6. Click "Deploy"

#### Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to link your project
# Add environment variables when prompted or via dashboard

# For production deployment
vercel --prod
```

### 6. Run Database Migrations

After deployment, you need to set up your database schema:

#### Option A: Using Vercel CLI

```bash
# Set environment variables locally
export DATABASE_URL="your-database-url"

# Run migrations
pnpm db:push
```

#### Option B: Via a one-time script

1. Create a temporary script in your project root called `migrate.js`:

```javascript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';
import { migrate } from 'drizzle-orm/mysql2/migrator';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete!');
await connection.end();
```

2. Run it once:
```bash
node migrate.js
```

3. Delete the script

### 7. Configure Your Vapi Assistant

Once deployed, you need to connect your Vercel app to Vapi:

1. **Get your Vercel URL**: After deployment, Vercel will provide a URL like `https://your-app.vercel.app`

2. **Create an agent** in your deployed app at `https://your-app.vercel.app`

3. **Get the webhook URL**: After creating an agent, you'll get a webhook URL like:
   ```
   https://your-app.vercel.app/api/trpc/webhook.vapi?input={"message":{...}}
   ```

4. **Configure Vapi**:
   - Go to [vapi.ai dashboard](https://dashboard.vapi.ai)
   - Create or edit an assistant
   - Set **Server URL** to: `https://your-app.vercel.app/api/trpc/webhook.vapi`
   - Enable these **Server Messages**:
     - `assistant-request` (required)
     - `conversation-update`
     - `assistant.started`
     - `end-of-call-report`

### 8. Test Your Deployment

1. Visit your Vercel URL
2. Log in (OAuth will work if configured)
3. Create a test agent
4. Make a test call via Vapi
5. Check that the conversation is logged in your dashboard

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Secret for signing sessions | Random 32+ char string |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `BUILT_IN_FORGE_API_KEY` | Manus AI API key | If using Manus instead of OpenAI |
| `BUILT_IN_FORGE_API_URL` | Manus AI endpoint | If using Manus AI |
| `MANUS_OAUTH_CLIENT_ID` | OAuth client ID | If using Manus OAuth |
| `MANUS_OAUTH_CLIENT_SECRET` | OAuth secret | If using Manus OAuth |
| `MANUS_OAUTH_REDIRECT_URI` | OAuth redirect | If using Manus OAuth |

## Troubleshooting

### Build Errors

**Issue**: `Cannot find module 'vite-plugin-manus-runtime'`
- **Solution**: This is expected. The plugin is optional and only needed for Manus platform. The build should continue.

**Issue**: TypeScript errors during build
- **Solution**: Check that all dependencies are installed. Run `pnpm install` again.

### Database Connection Errors

**Issue**: `Connection refused` or `Cannot connect to database`
- **Solution**: 
  1. Verify your `DATABASE_URL` is correct
  2. Ensure your database allows connections from Vercel's IP ranges
  3. For PlanetScale, use the format with `?sslaccept=strict`

**Issue**: `Table doesn't exist`
- **Solution**: Run database migrations using `pnpm db:push`

### API/Webhook Errors

**Issue**: Vapi webhook returning 500 errors
- **Solution**: 
  1. Check Vercel function logs
  2. Verify `OPENAI_API_KEY` or `BUILT_IN_FORGE_API_KEY` is set
  3. Check database connection is working

**Issue**: `OPENAI_API_KEY is not configured`
- **Solution**: Add the environment variable in Vercel dashboard and redeploy

### OAuth Errors

**Issue**: OAuth callback not working
- **Solution**: 
  1. Set `MANUS_OAUTH_REDIRECT_URI` to `https://your-app.vercel.app/api/oauth/callback`
  2. Configure the same URL in your Manus OAuth app settings
  3. Ensure all OAuth environment variables are set

## Performance Optimization

### Database Connection Pooling

For Vercel's serverless environment, use connection pooling:

```typescript
// In your database config
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 1, // Serverless requires small pool
});
```

### Edge Functions (Optional)

For better global performance, you can convert API routes to Edge functions by adding to `vercel.json`:

```json
{
  "functions": {
    "api/trpc.ts": {
      "runtime": "edge"
    }
  }
}
```

## Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Monitor in Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View:
   - Function logs
   - Error tracking
   - Performance metrics
   - Usage statistics

## Updating Your Deployment

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically deploy
# Or manually deploy:
vercel --prod
```

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed
5. Update Vapi webhook URL to use your custom domain

## Cost Estimates

- **Vercel**: Free tier includes 100GB bandwidth, unlimited deployments
- **PlanetScale**: Free tier includes 5GB storage, 1 billion row reads/month
- **OpenAI**: Pay per token (~$0.03 per 1K tokens for GPT-4o-mini)
- **Vapi**: See [vapi.ai pricing](https://vapi.ai/pricing)

## Security Best Practices

1. **Never commit** `.env` files or secrets to Git
2. **Rotate secrets** regularly (JWT_SECRET, API keys)
3. **Use environment variables** for all sensitive data
4. **Enable Vercel's** security features (e.g., headers, DDoS protection)
5. **Monitor logs** for suspicious activity
6. **Use HTTPS only** (Vercel provides this by default)

## Support

- **Vercel Issues**: [Vercel Documentation](https://vercel.com/docs)
- **Vapi Issues**: [Vapi Support](https://vapi.ai/support)
- **OpenAI Issues**: [OpenAI Help](https://help.openai.com)
- **Project Issues**: [GitHub Issues](https://github.com/Julianb233/Ian-Duffy-Vapi-Agent/issues)

---

Built with ❤️ for deployment on Vercel

