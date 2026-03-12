# Task Config 400 Error Fix

## Problem
When calling `/tasks/config`, you're getting a **400 error: "Task config yüklerken hata"**

The actual error is: **"Request failed with status code 400"**

## Root Cause
The endpoint requires `req.user.company_id` to be set, but it's coming back as `null` or `undefined`. This happens when:
1. The user in the database doesn't have a `companyId` assigned
2. The JWT token wasn't created with `company_id`
3. Both fallback mechanisms fail

## Changes Made

### 1. **Authentication Middleware** (`middleware/authMiddleware.js`)
- Added debug logging to show exactly what's happening
- Now logs user data when company_id is missing

### 2. **Task Controller** (`controllers/TaskController.js`)
- Enhanced error message with debug information
- Shows all user data keys in the error response (helps diagnose)

### 3. **Authentication Service** (`services/AuthService.js`)
- Added validation in `generateJWT()` to throw error if user has no company
- Better error message: "Cannot generate JWT: User has no company assigned"

## How to Diagnose

### Step 1: Check for Users Without Company
```bash
cd Backend
node scripts/diagnose-missing-company.js
```

This will show:
- ✓ All users and their company status
- ❌ Any users without a company (that's your problem)
- Total count of affected users

### Step 2: Fix Users Without Company

If you find users without a company, run:
```bash
node scripts/repair-missing-company.js
```

This will:
- Assign all orphaned users to the first available company
- Report how many users were fixed
- Users can then login successfully

## Testing the Fix

1. **Check if user has a company:**
   ```bash
   node scripts/diagnose-missing-company.js
   ```

2. **If users found without company:**
   ```bash
   node scripts/repair-missing-company.js
   ```

3. **Try logging in again** - the 400 error should be gone

## Error Details When It Fails

If `/tasks/config` still fails, the response will now include debug info:
```json
{
  "error": "Company ID not found in user data",
  "debug": {
    "userId": 123,
    "hasCompanyId": false,
    "userKeys": ["id", "email", "firstName", "lastName", ...]
  }
}
```

Look at the browser console (F12) to see this debug info.

## Prevention

The system now validates on JWT creation, so future users created without a company will get an error immediately instead of failing silently later.

## Backend Logs

When debugging, check your backend console for:
```
[AUTH] Missing company_id for user: {...}
[TaskController] getConfig - Missing company_id: {...}
[AuthService] generateJWT - User without companyId: {...}
```

These logs show exactly what data is available and what's missing.
