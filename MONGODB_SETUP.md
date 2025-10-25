# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### 1. Create Account
- Visit: https://www.mongodb.com/cloud/atlas/register
- Sign up with email or Google

### 2. Create FREE Cluster
- Click **"Build a Database"** → **"Shared"** (M0 FREE)
- Provider: AWS | Region: Nearest location
- Cluster Name: `CropYieldCluster`
- Click **"Create"** (wait 3-5 min)

### 3. Database User
- Username: `cropuser`
- Password: Generate secure password (SAVE IT!)
- Click **"Create User"**

### 4. Network Access
- Click **"Add My Current IP Address"**
- Or **"Allow Access from Anywhere"** (for dev)

### 5. Connection String
- Click **"Connect"** → **"Connect your application"**
- Driver: Node.js 4.1+
- Copy connection string:
```
mongodb+srv://cropuser:<password>@cropyieldcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
- Replace `<password>` with your password
- Add database name: `/crop_yield_db` before `?`

**Final Example:**
```
mongodb+srv://cropuser:MyPass123@cropyieldcluster.abc.mongodb.net/crop_yield_db?retryWrites=true&w=majority
```

## Common Issues

**"IP not whitelisted"**: Network Access → Add IP → Allow from Anywhere

**"Authentication failed"**: Verify username/password in Database Access

**"Connection timeout"**: Check internet, wait for cluster provisioning

## What You Get (FREE M0)
- ✅ 512 MB storage
- ✅ Up to 100 connections
- ✅ Perfect for development
- ❌ No automated backups

---

**Resources**: [Docs](https://docs.mongodb.com) | [Support](https://support.mongodb.com)
