# 🚀 SAM SYSTEM - DEPLOYMENT CHECKLIST

## ✅ Quick Setup Guide

### 1. Backend Setup

```bash
cd Backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Sync database
node sync.js

# Start development server
npm run dev

# Or with PM2 for production
pm2 start ecosystem.config.js
```

### 2. Frontend Setup

```bash
cd Frontend
npm install

# Start development server (runs on :3000, proxies /api to :5000)
npm run dev

# Build for production (outputs to Backend/public)
npm run build
```

### 3. Environment Variables Required

**Backend (.env):**
```
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=sam_db
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure real database credentials (not localhost)
- [ ] Enable HTTPS in production
- [ ] Update CORS_ORIGINS with actual frontend domain
- [ ] Set up firewall rules to only allow necessary ports
- [ ] Configure email service for notifications
- [ ] Configure SMS service (Netgsm, Twilio, etc.)
- [ ] Enable audit logging (ENABLE_AUDIT_LOGGING=true)
- [ ] Backup database regularly

---

## 🧪 Testing Checklist

### Authentication
- [ ] User can register company
- [ ] Admin user created with company
- [ ] Employee can register with company code
- [ ] User can login
- [ ] JWT token contains company_id and companyId
- [ ] Token expires after 7 days

### Company Isolation
- [ ] User A cannot see User B's data
- [ ] Department list shows only company's departments
- [ ] Tasks show only company's tasks
- [ ] Users list shows only company's users

### Task Management
- [ ] Can create task with status and priority
- [ ] Can assign user to task
- [ ] Can update task status
- [ ] Can create subtasks
- [ ] Can add comments to task
- [ ] Can upload files to task

### Validation
- [ ] Invalid email gets rejected
- [ ] Missing required fields rejected
- [ ] Company ID validations work
- [ ] Token validation works

### Error Handling
- [ ] 401 error on invalid token
- [ ] 403 error on insufficient permissions
- [ ] 404 error on not found resources
- [ ] 500 error on server errors
- [ ] Database errors handled gracefully

---

## 📊 Performance Checklist

- [ ] Database connection pool set to 20
- [ ] Frontend caching enabled
- [ ] Minified CSS/JS in production
- [ ] Images optimized
- [ ] API response times < 200ms (average)
- [ ] Database queries indexed
- [ ] Logs not too verbose in production

---

## 📋 Monitoring & Maintenance

### Logs Location
```
Backend/logs/
├── error.log      # Errors only
└── combined.log   # All logs
```

### Monitor These Metrics
- API response times
- Database connection pool usage
- Error rate
- Authentication failures
- Company isolation violations

### Regular Maintenance
- [ ] Review logs daily
- [ ] Check database size
- [ ] Backup database
- [ ] Update dependencies monthly
- [ ] Monitor disk space
- [ ] Check for memory leaks

---

## 🔍 Troubleshooting

### Issue: "Company ID not found"
**Solution:** 
- Check JWT token contains `company_id`
- Verify `_company_id` column exists in users table
- Run `node sync.js --alter` to update schema

### Issue: CORS errors
**Solution:**
- Set CORS_ORIGINS in .env
- Check FRONTEND_URL matches actual domain
- Verify credentials: true in CORS config

### Issue: 401 Unauthorized
**Solution:**
- Verify JWT_SECRET matches between requests
- Check token expiration (7 days)
- Verify token format: `Bearer <token>`

### Issue: Database connection errors
**Solution:**
- Verify DB credentials in .env
- Check database is running
- Check port 3306 is accessible
- Verify pool size in config

### Issue: SMS not sending
**Solution:**
- Configure SMS_PROVIDER and API_KEY in .env
- Implement actual SMS provider integration
- Check network access to SMS service

---

## 📞 Support & Contact

For issues, check:
1. `/Backend/logs/combined.log` for errors
2. Browser console for frontend errors
3. Database connection status
4. Environment variables configuration

---

## 📝 Version Info

- **Backend**: Node.js with Express + Sequelize
- **Frontend**: React 19 + Vite + TailwindCSS
- **Database**: MySQL 8+
- **Authentication**: JWT (7-day expiry)
- **Real-time**: Socket.io

---

**Last Updated**: March 12, 2026
**All Critical Fixes Applied**: ✅
