# Database Setup for No-Auth Mode

Since authentication is optional for testing, you need to create a guest user in the database.

## Step 1: Set Up Your Database

Create a MySQL database on PlanetScale, Neon, or any MySQL provider.

## Step 2: Run Migrations

```bash
# Set your DATABASE_URL
export DATABASE_URL="your-database-connection-string"

# Run Drizzle migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Step 3: Create Guest User

After running migrations, create a guest user with ID=1:

### Option A: Using MySQL Client

```sql
INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
VALUES (
  1,
  'guest-user',
  'Guest User',
  'guest@example.com',
  'none',
  'user',
  NOW(),
  NOW(),
  NOW()
);
```

### Option B: Using Drizzle Studio

```bash
# Open Drizzle Studio
npx drizzle-kit studio

# Then manually add a user with:
# - id: 1
# - openId: guest-user
# - name: Guest User
# - role: user
```

## Step 4: Verify

Your database should now have:
- ✅ All tables created (users, vapi_agents, call_sessions, etc.)
- ✅ Guest user with ID=1

## Notes

- **Guest User ID**: All agents and calls will be associated with user ID 1 when not authenticated
- **For Production**: Enable proper authentication by setting up OAuth environment variables
- **Security**: This no-auth mode is for testing only. For production, implement proper authentication.

## Environment Variables Needed

For Vercel deployment, set these in your Vercel dashboard:

```bash
# Required
DATABASE_URL=your-mysql-connection-string
JWT_SECRET=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=production

# Optional (for OAuth - if you want to enable auth later)
VITE_OAUTH_PORTAL_URL=
VITE_APP_ID=
MANUS_OAUTH_CLIENT_ID=
MANUS_OAUTH_CLIENT_SECRET=
```

## Testing the Setup

1. Visit your deployed app
2. Click "Get Started" or "Go to Dashboard"
3. Create a voice agent
4. Configure Vapi webhook
5. Make test calls

All operations will use the guest user (ID=1) by default.

