# Supabase Database Configuration Guide

## 🚨 Current Issue
Your Railway deployment is failing because:
1. **Supabase project is PAUSED** - needs to be unpaused in dashboard
2. **DATABASE_URL** is pointing to localhost instead of Supabase
3. **Database health checks** are failing and spamming errors

## 📋 Required Actions

### 1. Unpause Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/abbbvcbhtcpibaiqwfhf)
2. Click **"Unpause Project"** button
3. Wait for project to become active

### 2. Get Supabase Connection String
Once project is active:
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.abbbvcbhtcpibaiqwfhf.supabase.co:5432/postgres`

### 3. Update Railway Environment Variables
In your Railway dashboard, set these environment variables:

```bash
# Required - Replace [YOUR-PASSWORD] with actual password
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.abbbvcbhtcpibaiqwfhf.supabase.co:5432/postgres

# SSL Configuration for Supabase
DATABASE_SSL=true

# Connection Pool Settings (optimized for Supabase)
DATABASE_CONNECTION_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=600000
DATABASE_MAX_LIFETIME=3600000

# Optional - Database debugging
DATABASE_DEBUG=false
```

### 4. Supabase-Specific Configuration

#### Project Details:
- **Project ID**: `abbbvcbhtcpibaiqwfhf`
- **Region**: `us-east-2`
- **Host**: `db.abbbvcbhtcpibaiqwfhf.supabase.co`
- **Port**: `5432`

#### SSL Requirements:
- Supabase **requires SSL** connections in production
- Set `DATABASE_SSL=true` in Railway environment variables

## 🔧 Code Changes Made

### Fixed Database Health Checks
Updated `src/lib/database/connection-pool.ts`:
- Skip health checks when DATABASE_URL points to localhost in production
- Reduce error spam (only log once per minute)
- Graceful handling when database is unavailable

### Updated Environment Examples
Updated `.env.example` with Supabase connection format.

## 🚀 Deployment Steps

1. **Unpause Supabase project** (most important!)
2. **Get the actual database password** from Supabase settings
3. **Update DATABASE_URL** in Railway with your Supabase connection string
4. **Redeploy** your Railway service

## 🧪 Testing Connection

Once configured, you can test the connection locally:

```bash
# Set your environment variables
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.abbbvcbhtcpibaiqwfhf.supabase.co:5432/postgres"

# Test connection
npx supabase db ping
```

## 📝 Environment Variable Template

Copy this to your Railway environment variables (replace placeholders):

```
DATABASE_URL=postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.abbbvcbhtcpibaiqwfhf.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_CONNECTION_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=600000
NODE_ENV=production
```

## 🔍 Verification

After deployment, check:
1. ✅ No more "ECONNREFUSED 127.0.0.1:5432" errors
2. ✅ Health check endpoint `/api/health` returns 200
3. ✅ Database-dependent features work correctly

## 📞 Support

If issues persist:
1. Check Supabase project is **active** (not paused)
2. Verify DATABASE_URL format matches exactly
3. Ensure password is correct (check Supabase settings)
4. Check Railway logs for specific error messages