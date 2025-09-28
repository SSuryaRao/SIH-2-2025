# College ERP System Backend

A comprehensive College Enterprise Resource Planning (ERP) system built with Node.js, Express, and Firebase Firestore.

## 🚀 Features

### Core Modules
- **Users Management**: Role-based authentication (Student, Staff, Warden, Admin)
- **Students**: Student admissions, details, documents management
- **Fees**: Fee payment tracking, receipts, and reporting
- **Hostels**: Room allocation, occupancy management
- **Exams**: Exam schedules, student registration

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT + Firebase Auth
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Joi

## 📋 Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Firebase Admin SDK service account key

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-erp-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Generate a service account key from Project Settings > Service accounts
   - Update `.env` file with your Firebase credentials

5. **Environment Variables**
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
   ```

## 🚦 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Users
```bash
POST /api/users/register      # Register new user
POST /api/users/login         # User login
GET  /api/users/profile       # Get current user profile
GET  /api/users               # Get all users (admin only)
```

#### Students
```bash
POST /api/students            # Add new student (admin/staff)
GET  /api/students            # Get all students (admin/staff)
GET  /api/students/my-details # Get own details (student)
GET  /api/students/:id        # Get student by ID
PUT  /api/students/:id        # Update student (admin/staff)
```

#### Fees
```bash
POST /api/fees                    # Create fee structure (admin/staff)
GET  /api/fees                    # Get all fees (admin/staff)
GET  /api/fees/my-fees           # Get own fees (student)
POST /api/fees/:id/payment       # Record payment (admin/staff)
GET  /api/fees/:id/payments      # Get payment history
```

#### Hostels
```bash
GET  /api/hostels                     # Get all hostels
POST /api/hostels/allocate           # Allocate room (admin/warden)
GET  /api/hostels/my-allocation      # Get own allocation (student)
GET  /api/hostels/:id/occupancy-report # Get occupancy report
```

#### Exams
```bash
GET  /api/exams                   # Get all exams
POST /api/exams                   # Create exam (admin/staff)
POST /api/exams/register         # Register for exam (student)
GET  /api/exams/my-schedule      # Get own exam schedule (student)
GET  /api/exams/my-registrations # Get own registrations (student)
```

## 🔐 User Roles & Permissions

### Admin
- Full access to all modules
- User management
- System configuration

### Staff
- Student management
- Fee management
- Exam management
- View reports

### Warden
- Hostel management
- Room allocation
- Occupancy reports

### Student
- View own details
- View fees and payments
- Register for exams
- View hostel allocation

## 📊 Database Schema

The system uses Firebase Firestore with the following main collections:

- `users` - User accounts and profiles
- `students` - Student information and academic details
- `fees` - Fee structures and payment records
- `hostels` - Hostel information
- `hostelRooms` - Room details
- `hostelAllocations` - Room allocation records
- `exams` - Exam schedules and details
- `examRegistrations` - Student exam registrations

See `DATABASE_SCHEMA.md` for detailed schema structure.

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Request rate limiting
- Input validation with Joi
- Security headers with Helmet
- CORS configuration
- Password hashing with bcrypt

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.js  # Database helpers
│   └── firebase.js  # Firebase configuration
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation schemas
└── server.js        # Main application file
```

## 🔧 Development

### Code Style
- Use ES6+ features
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Include proper error handling

### Adding New Features
1. Create service in `src/services/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add validation schemas in `src/middleware/validation.js`
5. Update route index and documentation

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

The application uses Morgan for HTTP request logging:
- Development: Detailed colored logs
- Production: Standard Apache-style logs

## 🚨 Error Handling

Centralized error handling with:
- Custom error middleware
- Async wrapper for controllers
- Structured error responses
- Environment-specific stack traces

## 📊 Monitoring

Health check endpoint: `GET /api/health`

Response:
```json
{
  "success": true,
  "message": "College ERP API is running",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "development"
}
```

## 🚀 Deployment

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secret
- Configure proper CORS origins
- Set up proper logging
- Use production Firebase project

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api`
- Review the database schema in `DATABASE_SCHEMA.md`

## 🎯 Roadmap

- [ ] Email notifications
- [ ] File upload handling
- [ ] Advanced reporting
- [ ] Mobile API optimizations
- [ ] Caching layer
- [ ] Audit logging
- [ ] Backup management