# College ERP System - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

#### Option A: Using Environment Variables (Recommended)
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Go to Project Settings → Service accounts
4. Generate new private key (downloads JSON file)
5. Copy values to `.env`:

```env
# Copy .env.example to .env first
cp .env.example .env

# Then fill in these values from your Firebase service account JSON:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----"

# Generate a strong JWT secret
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

#### Option B: Using Service Account File
1. Place your `serviceAccountKey.json` in the project root
2. Set in `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Or production mode
npm start
```

Server runs at: http://localhost:5000

## ✅ Verify Installation

### Test API Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "College ERP API is running",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "development"
}
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "password123",
    "name": "System Administrator",
    "role": "admin"
  }'
```

## 🔧 Common Issues & Solutions

### Issue: Firebase Authentication Error
**Solution**: Ensure your Firebase private key is properly formatted with `\n` for newlines.

### Issue: "Firebase project not found"
**Solution**: Verify your `FIREBASE_PROJECT_ID` matches your Firebase console project ID.

### Issue: Port already in use
**Solution**: Change port in `.env`:
```env
PORT=5001
```

### Issue: CORS errors from frontend
**Solution**: Add your frontend URL to CORS configuration in `src/server.js`:
```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'http://your-frontend-url.com'],
  // ...
};
```

## 📊 Firestore Security Rules (Optional)

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin SDK access (for server)
    match /{document=**} {
      allow read, write: if false; // Only server can access
    }
  }
}
```

## 🧪 Test Data Creation

Use these API calls to create sample data:

### 1. Create Admin User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123",
    "name": "System Administrator",
    "role": "admin"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123"
  }'
```

Save the returned token for subsequent requests.

### 3. Create Sample Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  -d '{
    "personalInfo": {
      "name": "John Doe",
      "email": "john@student.college.edu",
      "phone": "9876543210",
      "dateOfBirth": "2000-01-15",
      "gender": "male",
      "address": {
        "permanent": "123 Main St, City, State",
        "current": "College Hostel Room 101"
      }
    },
    "academicInfo": {
      "course": "CSE",
      "branch": "Computer Science",
      "semester": 3,
      "year": 2,
      "rollNumber": "CSE2022001",
      "admissionDate": "2022-08-01"
    }
  }'
```

## 📚 API Testing

### Using Postman
1. Import the API endpoints
2. Set up environment variables for base URL and JWT token
3. Test all endpoints systematically

### Using curl
Check `README.md` for complete API documentation with curl examples.

## 🎯 Next Steps

1. **Frontend Integration**: Connect your Next.js frontend
2. **Production Deployment**: Deploy to cloud platform
3. **Monitoring**: Set up logging and monitoring
4. **Backup**: Configure Firestore backups
5. **Security**: Review and enhance security settings

## 📞 Getting Help

- Check `README.md` for detailed documentation
- Review `DATABASE_SCHEMA.md` for database structure
- Create GitHub issues for bugs or questions
- Check Firebase Console for database and authentication status

Happy coding! 🚀