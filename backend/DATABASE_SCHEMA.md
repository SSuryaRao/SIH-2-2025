# College ERP - Firestore Database Schema

## Collections Structure

### 1. users
```
users/{userId}
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  name: string,             // Full name
  role: string,             // 'student', 'staff', 'warden', 'admin'
  isActive: boolean,        // Account status
  createdAt: timestamp,
  updatedAt: timestamp,
  profile: {
    phone?: string,
    address?: string,
    department?: string,    // For staff/admin
    designation?: string    // For staff/admin
  }
}
```

### 2. students
```
students/{studentId}
{
  studentId: string,        // Unique student ID (e.g., "STU2024001")
  userId: string,           // Reference to users collection
  personalInfo: {
    name: string,
    email: string,
    phone: string,
    dateOfBirth: timestamp,
    gender: string,
    bloodGroup?: string,
    address: {
      permanent: string,
      current: string
    }
  },
  academicInfo: {
    course: string,
    branch: string,
    semester: number,
    year: number,
    rollNumber: string,
    admissionDate: timestamp,
    status: string          // 'active', 'graduated', 'dropped'
  },
  documents: {
    photo?: string,         // URL to photo
    aadhar?: string,        // URL to document
    marksheet?: string,
    transferCertificate?: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. fees
```
fees/{feeId}
{
  feeId: string,
  studentId: string,        // Reference to student
  academicYear: string,     // "2024-25"
  semester: number,
  feeStructure: {
    tuitionFee: number,
    libraryFee: number,
    labFee: number,
    examFee: number,
    miscellaneous: number,
    total: number
  },
  payments: [{
    paymentId: string,
    amount: number,
    paymentDate: timestamp,
    paymentMode: string,    // 'cash', 'card', 'upi', 'bank_transfer'
    transactionId?: string,
    receiptNumber: string,
    status: string          // 'pending', 'completed', 'failed'
  }],
  totalPaid: number,
  balance: number,
  status: string,           // 'pending', 'partial', 'completed', 'overdue'
  dueDate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. hostels
```
hostels/{hostelId}
{
  hostelId: string,
  name: string,             // "Boys Hostel A", "Girls Hostel B"
  type: string,             // 'boys', 'girls'
  totalRooms: number,
  warden: {
    userId: string,         // Reference to users collection
    name: string
  },
  facilities: string[],     // ['wifi', 'mess', 'laundry', 'gym']
  address: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

hostelRooms/{roomId}
{
  roomId: string,
  hostelId: string,         // Reference to hostel
  roomNumber: string,
  floor: number,
  capacity: number,         // Maximum occupants
  currentOccupancy: number,
  type: string,             // 'single', 'double', 'triple'
  facilities: string[],     // ['ac', 'attached_bathroom', 'balcony']
  rent: number,             // Monthly rent
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}

hostelAllocations/{allocationId}
{
  allocationId: string,
  studentId: string,        // Reference to student
  roomId: string,           // Reference to room
  hostelId: string,         // Reference to hostel
  allocatedDate: timestamp,
  vacatedDate?: timestamp,
  status: string,           // 'active', 'vacated', 'pending'
  monthlyRent: number,
  securityDeposit: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. admissions
```
admissions/{admissionId}
{
  admissionId: string,
  applicationNumber: string,  // Generated unique number
  personalInfo: {
    name: string,
    email: string,
    phone: string,
    dateOfBirth: timestamp,
    gender: string,
    bloodGroup?: string,
    category: string,         // General, OBC, SC, ST, etc.
    nationality: string,
    religion?: string,
    address: {
      permanent: {
        street: string,
        city: string,
        state: string,
        pincode: string,
        country: string
      },
      correspondence: {
        street: string,
        city: string,
        state: string,
        pincode: string,
        country: string,
        sameAsPermanent: boolean
      }
    }
  },
  parentInfo: {
    father: {
      name: string,
      occupation: string,
      income: number,
      phone?: string,
      email?: string
    },
    mother: {
      name: string,
      occupation: string,
      income: number,
      phone?: string,
      email?: string
    },
    guardian?: {
      name: string,
      relation: string,
      occupation: string,
      phone: string,
      email?: string
    }
  },
  academicInfo: {
    appliedCourse: string,
    appliedBranch: string,
    previousEducation: [{
      level: string,           // "10th", "12th", "Diploma", "Bachelor"
      board: string,           // CBSE, ICSE, State Board, etc.
      school: string,
      year: number,
      percentage: number,
      subjects?: string[]
    }],
    entranceExam?: {
      name: string,           // JEE, NEET, etc.
      rollNumber: string,
      rank: number,
      score: number,
      year: number
    }
  },
  documents: {
    photo?: string,           // URL to uploaded photo
    signature?: string,       // URL to uploaded signature
    class10Certificate?: string,
    class12Certificate?: string,
    transferCertificate?: string,
    migrationCertificate?: string,
    aadharCard?: string,
    incomeCertificate?: string,
    casteCertificate?: string,
    domicileCertificate?: string,
    entranceExamScorecard?: string
  },
  feeInfo: {
    admissionFee: number,
    processingFee: number,
    totalFee: number,
    paymentStatus: string,    // 'pending', 'paid', 'partial'
    paymentDetails?: {
      transactionId: string,
      amount: number,
      paymentDate: timestamp,
      paymentMode: string
    }
  },
  status: string,             // 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted'
  reviewInfo: {
    reviewedBy?: string,      // Staff/Admin userId
    reviewedAt?: timestamp,
    reviewComments?: string,
    approvalScore?: number
  },
  submittedAt: timestamp,
  lastUpdatedAt: timestamp,
  createdAt: timestamp
}
```

### 6. library
```
library/books/{bookId}
{
  bookId: string,
  isbn: string,
  title: string,
  author: string[],
  publisher: string,
  publishedYear: number,
  category: string,           // Fiction, Technical, Reference, etc.
  subject?: string,           // For academic books
  edition: number,
  totalCopies: number,
  availableCopies: number,
  language: string,
  description?: string,
  imageUrl?: string,
  shelfLocation: string,      // Section-Row-Shelf (e.g., "CS-A-15")
  price: number,
  addedDate: timestamp,
  status: string,             // 'active', 'damaged', 'lost', 'maintenance'
  createdAt: timestamp,
  updatedAt: timestamp
}

library/issues/{issueId}
{
  issueId: string,
  bookId: string,             // Reference to book
  studentId: string,          // Reference to student
  issueDate: timestamp,
  dueDate: timestamp,
  returnDate?: timestamp,
  status: string,             // 'issued', 'returned', 'overdue', 'lost'
  fineAmount: number,         // Late return fine
  fineStatus: string,         // 'none', 'pending', 'paid'
  renewalCount: number,       // Number of times renewed
  issuedBy: string,           // Staff userId
  returnedTo?: string,        // Staff userId
  condition: {
    atIssue: string,          // 'good', 'fair', 'damaged'
    atReturn?: string         // 'good', 'fair', 'damaged'
  },
  notes?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

library/settings/{settingId}
{
  maxBooksPerStudent: number,
  issueDurationDays: number,
  maxRenewalCount: number,
  finePerDay: number,
  maxFineDays: number,
  libraryHours: {
    monday: { open: string, close: string },
    tuesday: { open: string, close: string },
    wednesday: { open: string, close: string },
    thursday: { open: string, close: string },
    friday: { open: string, close: string },
    saturday: { open: string, close: string },
    sunday: { open: string, close: string }
  },
  updatedAt: timestamp
}
```

### 7. exams
```
exams/{examId}
{
  examId: string,
  title: string,            // "Mid Semester Exam", "Final Exam"
  academicYear: string,     // "2024-25"
  semester: number,
  examType: string,         // 'mid_term', 'final', 'supplementary'
  startDate: timestamp,
  endDate: timestamp,
  registrationStartDate: timestamp,
  registrationEndDate: timestamp,
  subjects: [{
    subjectCode: string,
    subjectName: string,
    examDate: timestamp,
    startTime: string,      // "10:00"
    duration: number,       // Duration in minutes
    maxMarks: number,
    venue: string
  }],
  eligibleCourses: string[], // ['CSE', 'ECE', 'MECH']
  status: string,           // 'upcoming', 'registration_open', 'ongoing', 'completed'
  createdAt: timestamp,
  updatedAt: timestamp
}

examRegistrations/{registrationId}
{
  registrationId: string,
  examId: string,           // Reference to exam
  studentId: string,        // Reference to student
  registeredSubjects: [{
    subjectCode: string,
    subjectName: string,
    isEligible: boolean,
    registrationFee: number
  }],
  totalFee: number,
  paymentStatus: string,    // 'pending', 'paid'
  registrationDate: timestamp,
  status: string,           // 'registered', 'cancelled'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Indexes Required

1. **users**: email, role
2. **students**: userId, studentId, academicInfo.course, academicInfo.status
3. **fees**: studentId, academicYear, status
4. **hostelAllocations**: studentId, roomId, status
5. **examRegistrations**: examId, studentId, status
6. **admissions**: applicationNumber, personalInfo.email, academicInfo.appliedCourse, status, submittedAt
7. **library/books**: isbn, title, author, category, subject, status
8. **library/issues**: bookId, studentId, status, issueDate, dueDate