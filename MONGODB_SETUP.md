# MongoDB Atlas - Quick Setup Guide

## 🎯 Create Your MongoDB Cluster in 5 Minutes

### Step 1: Sign Up
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email

### Step 2: Create a FREE Cluster
1. Click **"Build a Database"**
2. Choose **"Shared"** (FREE tier - M0)
3. Select:
   - **Provider**: AWS (recommended)
   - **Region**: Select closest to your location
   - **Cluster Name**: `CropYieldCluster`
4. Click **"Create"** (wait 3-5 minutes)

### Step 3: Create Database User
1. **Security Quickstart** appears automatically
2. Choose **"Username and Password"**
   - Username: `cropuser`
   - Password: Click **"Autogenerate Secure Password"** and SAVE IT!
   - Or create your own secure password
3. Click **"Create User"**

### Step 4: Whitelist Your IP
1. Next screen: **"Where would you like to connect from?"**
2. Click **"Add My Current IP Address"**
   - Or choose **"Allow Access from Anywhere"** (for testing)
3. Click **"Finish and Close"**

### Step 5: Get Connection String
1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select:
   - Driver: **Node.js**
   - Version: **4.1 or later**
4. **COPY** the connection string:
   ```
   mongodb+srv://cropuser:<password>@cropyieldcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace** `<password>` with your actual password
6. **Add** database name: `/crop_yield_db` before the `?`

### Final Connection String Example:
```
mongodb+srv://cropuser:MySecurePass123@cropyieldcluster.abc123.mongodb.net/crop_yield_db?retryWrites=true&w=majority
```

---

## 📸 Visual Guide

### Cluster Dashboard
After creation, you'll see:
- ✅ Cluster Name: CropYieldCluster
- ✅ Status: Active (green)
- ✅ M0 Sandbox (FREE)
- ✅ Storage: 512 MB

### Monitoring
- View real-time operations
- Monitor connections
- Check storage usage

---

## 🔐 Security Best Practices

### For Development:
- ✅ Use strong passwords
- ✅ Enable IP whitelisting
- ✅ Never commit .env files

### For Production:
- ✅ Use environment variables
- ✅ Restrict IP addresses
- ✅ Enable MongoDB encryption
- ✅ Regular backups
- ✅ Monitor access logs

---

## 🔍 Verify Your Setup

### Test Connection in Node.js:
```javascript
const mongoose = require('mongoose');

mongoose.connect('YOUR_CONNECTION_STRING')
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));
```

### Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Paste your connection string
3. Click "Connect"
4. Browse your database visually

---

## ❓ Common Issues & Solutions

### Issue: "IP not whitelisted"
**Solution**: Go to Network Access → Add IP Address → Allow Access from Anywhere

### Issue: "Authentication failed"
**Solution**: 
- Check username and password
- Ensure no special characters in password need URL encoding
- Generate a new password in Database Access

### Issue: "Connection timeout"
**Solution**:
- Check your internet connection
- Verify firewall settings
- Try different network (mobile hotspot)

### Issue: "Cannot connect to cluster"
**Solution**:
- Wait for cluster to fully provision (3-5 min)
- Refresh the page
- Check MongoDB Atlas status page

---

## 📱 Managing Your Database

### Using MongoDB Atlas Interface:
1. **Browse Collections**: Click "Browse Collections"
2. **View Data**: See your crops collection
3. **Search**: Use filters and queries
4. **Export**: Download data as JSON/CSV

### Database Tools:
- **Charts**: Create visualizations
- **Realm**: Build APIs
- **Atlas Search**: Full-text search
- **Triggers**: Automated functions

---

## 💰 Pricing Tiers

### M0 (FREE) - What You Get:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Perfect for development
- ✅ Up to 100 connections
- ❌ No backups
- ❌ Limited throughput

### Upgrade When:
- You need more storage (>512MB)
- Require automated backups
- Need dedicated resources
- Going to production

---

## 📊 Database Structure

After seeding, your MongoDB will have:

**Database**: `crop_yield_db`

**Collection**: `crops`

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "Crop": "Rice",
  "Crop_Year": 2020,
  "Season": "Kharif",
  "State": "Punjab",
  "Area": 15000,
  "Production": 12000,
  "Annual_Rainfall": 1200.5,
  "Fertilizer": 50000.25,
  "Pesticide": 1500.75,
  "Yield": 0.8,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 🔗 Useful Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Documentation**: https://docs.mongodb.com
- **MongoDB University**: https://university.mongodb.com (FREE courses)
- **Community Forums**: https://www.mongodb.com/community/forums
- **Support**: https://support.mongodb.com

---

## ✅ Checklist

Before starting your application:

- [ ] MongoDB Atlas account created
- [ ] Free cluster created and active
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] Password saved securely
- [ ] Connection string added to .env
- [ ] Backend can connect to MongoDB
- [ ] Database seeded with data

---

**🎉 You're all set! Your MongoDB cluster is ready to use!**
