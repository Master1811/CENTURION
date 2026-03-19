# 100Cr Engine - Local Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** v18+ (recommended: v20)
- **Python** 3.11+
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/100cr-engine.git
cd 100cr-engine
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
CORS_ORIGINS=http://localhost:3000

# Supabase (Required for authentication and data persistence)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: AI features (Anthropic)
ANTHROPIC_API_KEY=your-anthropic-key

# Optional: Rate limiting (leave empty for in-memory)
REDIS_URL=
```

Start the backend:
```bash
uvicorn server:app --reload --port 8001
```

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Start the frontend:
```bash
yarn start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/api/docs

## Supabase Setup (Required)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization, name, password, and region
4. Wait for the project to be provisioned (~2 minutes)

### 2. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file `/docs/supabase_schema.sql` from this repo
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** to create all tables

This creates:
- `profiles` - User profile data
- `subscriptions` - Subscription status
- `projection_runs` - Saved projections
- `checkins` - Monthly revenue check-ins
- `connector_keys` - Encrypted API keys
- `quiz_submissions` - Quiz responses
- `ai_usage_log` - AI feature tracking

### 3. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `SUPABASE_URL` / `REACT_APP_SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY` / `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (backend only, keep secret!)

### 5. Verify Setup

After adding the keys to your `.env` files and restarting the servers:

```bash
# Test backend health
curl http://localhost:8001/api/health

# Should return:
# {"status":"ok","version":"3.0.0","environment":"development","supabase":"connected"}
```

## Development Workflow

### Running Both Services

Use two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

### Testing the API

```bash
# Run a projection
curl -X POST http://localhost:8001/api/engine/projection \
  -H "Content-Type: application/json" \
  -d '{"currentMRR": 500000, "growthRate": 0.08}'

# Get benchmarks
curl http://localhost:8001/api/benchmarks/seed
```

### Testing Authentication

1. Open http://localhost:3000
2. Click "Get Started" to open the auth modal
3. Enter your email
4. Check your email for the magic link
5. Click the link to authenticate
6. You'll be redirected to the dashboard

### Linting

**Backend:**
```bash
cd backend
ruff check .
ruff check . --fix  # Auto-fix issues
```

**Frontend:**
```bash
cd frontend
yarn lint
```

## Common Issues

### "Supabase not configured" in logs
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `backend/.env`
- Make sure there are no placeholder values

### "Table not found" errors
- Run the SQL schema in Supabase SQL Editor
- See "Create Database Tables" section above

### CORS errors
- Add `http://localhost:3000` to `CORS_ORIGINS` in backend `.env`
- Restart the backend server

### Magic link not working
- Check your spam folder
- Verify redirect URLs in Supabase dashboard
- Make sure `REACT_APP_SUPABASE_URL` is correct in frontend `.env`

### "Module not found"
- Backend: `pip install -r requirements.txt`
- Frontend: `yarn install`

## Project Structure

```
100cr-engine/
├── backend/
│   ├── main.py            # Main FastAPI application
│   ├── server.py          # Entry point for uvicorn
│   ├── routers/           # API endpoint handlers
│   │   ├── engine.py      # Projection calculations
│   │   ├── benchmarks.py  # Benchmark data
│   │   ├── ai.py          # AI coaching features
│   │   ├── reports.py     # Dashboard & check-ins
│   │   ├── connectors.py  # Payment integrations
│   │   └── admin.py       # Admin endpoints
│   ├── services/          # Business logic
│   │   ├── supabase.py    # Database operations
│   │   ├── auth.py        # JWT verification
│   │   ├── rate_limiter.py
│   │   ├── encryption.py
│   │   └── anthropic.py   # AI service
│   ├── models/            # Pydantic models
│   ├── tasks/             # Background tasks
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Routes & providers
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   └── lib/           # Utilities
│   └── package.json
│
├── docs/
│   ├── local_setup_guide.md
│   ├── comprehensive_guide.md
│   ├── nextjs_migration_guide.md
│   └── supabase_schema.sql
│
└── README.md
```

## Next Steps

1. **Create a test user**: Sign up via magic link
2. **Run your first projection**: Use the 100Cr Calculator
3. **Grant yourself a subscription**: For testing paid features:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO subscriptions (user_id, status, plan, starts_at, expires_at)
   VALUES ('YOUR_USER_ID', 'active', 'founder', NOW(), NOW() + INTERVAL '1 year');
   ```
4. **Explore the dashboard**: Access `/dashboard` after signing in

## Support

- **Documentation**: See `comprehensive_guide.md`
- **API Reference**: Visit `/api/docs` on your running backend
- **Issues**: Create a GitHub issue
