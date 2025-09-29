# 🎯 OneCampus College ERP System - System Architecture & Flowchart

## 🌐 System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React/Next.js Frontend]
        PWA[Progressive Web App]
        Mobile[Mobile Browser]
    end

    subgraph "Security Layer"
        Auth[JWT Authentication]
        RBAC[Role-Based Access Control]
        Validation[Input Validation]
    end

    subgraph "Application Layer"
        API[Express.js REST API]
        Middleware[Security Middleware]
        Controllers[Business Logic Controllers]
    end

    subgraph "Data Layer"
        Firebase[Firebase Firestore]
        Storage[Firebase Storage]
        Cache[Redis Cache]
    end

    UI --> Auth
    PWA --> Auth
    Mobile --> Auth
    Auth --> API
    RBAC --> API
    Validation --> API
    API --> Controllers
    Middleware --> Controllers
    Controllers --> Firebase
    Controllers --> Storage
    Controllers --> Cache
```

## 🏗️ Detailed System Flow

```mermaid
flowchart TD
    Start([User Access System]) --> Login{User Login}

    Login -->|New User| Register[User Registration]
    Login -->|Existing User| Auth[Authentication]

    Register --> Validate[Validate Input]
    Validate -->|Valid| CreateUser[Create User Account]
    Validate -->|Invalid| RegError[Registration Error]
    CreateUser --> SendWelcome[Send Welcome Email]
    SendWelcome --> Dashboard

    Auth --> CheckRole{Check User Role}

    CheckRole -->|Admin| AdminDash[Admin Dashboard]
    CheckRole -->|Staff| StaffDash[Staff Dashboard]
    CheckRole -->|Warden| WardenDash[Warden Dashboard]
    CheckRole -->|Student| StudentDash[Student Dashboard]

    subgraph "Admin Functions"
        AdminDash --> UserMgmt[User Management]
        AdminDash --> StudentMgmt[Student Management]
        AdminDash --> FeeMgmt[Fee Management]
        AdminDash --> HostelMgmt[Hostel Management]
        AdminDash --> ExamMgmt[Exam Management]
        AdminDash --> Reports[System Reports]
    end

    subgraph "Staff Functions"
        StaffDash --> StudentOps[Student Operations]
        StaffDash --> FeeOps[Fee Operations]
        StaffDash --> ExamOps[Exam Operations]
        StaffDash --> StaffReports[Staff Reports]
    end

    subgraph "Warden Functions"
        WardenDash --> RoomAlloc[Room Allocation]
        WardenDash --> Occupancy[Occupancy Management]
        WardenDash --> Maintenance[Maintenance Requests]
        WardenDash --> WardenReports[Warden Reports]
    end

    subgraph "Student Functions"
        StudentDash --> Profile[View Profile]
        StudentDash --> Fees[View Fees]
        StudentDash --> Hostel[Hostel Information]
        StudentDash --> Exams[Exam Registration]
    end

    UserMgmt --> Database[(Firebase Firestore)]
    StudentMgmt --> Database
    FeeMgmt --> Database
    HostelMgmt --> Database
    ExamMgmt --> Database
    Reports --> Database

    StudentOps --> Database
    FeeOps --> Database
    ExamOps --> Database

    RoomAlloc --> Database
    Occupancy --> Database
    Maintenance --> Database

    Profile --> Database
    Fees --> Database
    Hostel --> Database
    Exams --> Database

    Database --> Sync[Real-time Sync]
    Sync --> Notifications[Push Notifications]

    Dashboard --> Logout[Logout]
    AdminDash --> Logout
    StaffDash --> Logout
    WardenDash --> Logout
    StudentDash --> Logout

    Logout --> End([Session End])
```

## 🔐 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant API as Backend API
    participant Auth as JWT Service
    participant DB as Firebase DB

    User->>Frontend: Enter Credentials
    Frontend->>API: POST /api/auth/login
    API->>DB: Validate User
    DB->>API: User Data
    API->>Auth: Generate JWT Token
    Auth->>API: JWT Token
    API->>Frontend: Token + User Data
    Frontend->>Frontend: Store Token
    Frontend->>User: Redirect to Dashboard

    Note over User,DB: Subsequent Requests
    User->>Frontend: Access Protected Route
    Frontend->>API: Request with JWT Header
    API->>Auth: Verify Token
    Auth->>API: Token Valid/Invalid
    API->>DB: Fetch Data (if valid)
    DB->>API: Return Data
    API->>Frontend: Protected Data
    Frontend->>User: Display Data
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        Dashboard[Dashboard]
        Forms[Forms]
        Tables[Data Tables]
        Charts[Analytics Charts]
    end

    subgraph "State Management"
        Context[React Context]
        LocalState[Component State]
        Cache[Browser Cache]
    end

    subgraph "API Layer"
        REST[REST Endpoints]
        Middleware[Auth Middleware]
        Controllers[Controllers]
        Services[Business Services]
    end

    subgraph "Database Layer"
        Users[Users Collection]
        Students[Students Collection]
        Fees[Fees Collection]
        Hostels[Hostels Collection]
        Exams[Exams Collection]
    end

    Dashboard --> Context
    Forms --> LocalState
    Tables --> Context
    Charts --> Context

    Context --> REST
    LocalState --> REST
    Cache --> REST

    REST --> Middleware
    Middleware --> Controllers
    Controllers --> Services

    Services --> Users
    Services --> Students
    Services --> Fees
    Services --> Hostels
    Services --> Exams

    Users --> Services
    Students --> Services
    Fees --> Services
    Hostels --> Services
    Exams --> Services
```

## 🏢 Module Interaction Flow

```mermaid
graph TD
    subgraph "Student Module"
        StudentReg[Student Registration]
        StudentProfile[Student Profile]
        StudentDocs[Student Documents]
    end

    subgraph "Fee Module"
        FeeStructure[Fee Structure]
        PaymentGateway[Payment Gateway]
        FeeReceipts[Fee Receipts]
    end

    subgraph "Hostel Module"
        RoomMgmt[Room Management]
        Allocation[Room Allocation]
        Occupancy[Occupancy Tracking]
    end

    subgraph "Exam Module"
        ExamSchedule[Exam Scheduling]
        Registration[Exam Registration]
        Results[Result Management]
    end

    subgraph "Notification System"
        EmailNotif[Email Notifications]
        SMSNotif[SMS Notifications]
        PushNotif[Push Notifications]
    end

    StudentReg --> FeeStructure
    StudentProfile --> Allocation
    StudentProfile --> Registration

    FeeStructure --> PaymentGateway
    PaymentGateway --> FeeReceipts
    FeeReceipts --> EmailNotif

    Allocation --> RoomMgmt
    RoomMgmt --> Occupancy
    Occupancy --> SMSNotif

    ExamSchedule --> Registration
    Registration --> Results
    Results --> PushNotif

    EmailNotif --> StudentProfile
    SMSNotif --> StudentProfile
    PushNotif --> StudentProfile
```

## 🔄 Real-time Data Synchronization

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Staff as Staff User
    participant Student as Student User
    participant API as Backend API
    participant Firebase as Firebase DB
    participant Sync as Real-time Sync

    Admin->>API: Update Student Fee
    API->>Firebase: Write Fee Data
    Firebase->>Sync: Trigger Real-time Update
    Sync->>Staff: Notify Fee Update
    Sync->>Student: Notify Fee Update
    Staff->>Staff: Update UI
    Student->>Student: Update Dashboard

    Note over Admin,Student: All users see updates instantly
```

## 🛡️ Security Flow

```mermaid
flowchart TD
    Request[Incoming Request] --> RateLimit{Rate Limiting}
    RateLimit -->|Within Limit| Helmet[Security Headers]
    RateLimit -->|Exceeded| Block[Block Request]

    Helmet --> CORS{CORS Check}
    CORS -->|Valid Origin| JWT{JWT Validation}
    CORS -->|Invalid Origin| Reject[Reject Request]

    JWT -->|Valid Token| Role{Role Check}
    JWT -->|Invalid Token| Unauthorized[401 Unauthorized]

    Role -->|Authorized| Validate[Input Validation]
    Role -->|Unauthorized| Forbidden[403 Forbidden]

    Validate -->|Valid Input| Process[Process Request]
    Validate -->|Invalid Input| BadRequest[400 Bad Request]

    Process --> Database[(Secure Database)]
    Database --> Encrypt[Encrypt Sensitive Data]
    Encrypt --> Response[Send Response]

    Block --> ErrorLog[Log Security Event]
    Reject --> ErrorLog
    Unauthorized --> ErrorLog
    Forbidden --> ErrorLog
    BadRequest --> ErrorLog
```

## 📱 Mobile & Responsive Flow

```mermaid
graph TD
    User[User Device] --> Detect{Device Detection}

    Detect -->|Desktop| DesktopUI[Desktop Layout]
    Detect -->|Tablet| TabletUI[Tablet Layout]
    Detect -->|Mobile| MobileUI[Mobile Layout]

    DesktopUI --> Features[Full Features]
    TabletUI --> Features
    MobileUI --> MobileFeatures[Optimized Features]

    Features --> PWA{PWA Support}
    MobileFeatures --> PWA

    PWA -->|Supported| InstallPrompt[Install Prompt]
    PWA -->|Not Supported| BrowserOnly[Browser Only]

    InstallPrompt --> AppIcon[Add to Home Screen]
    BrowserOnly --> WebApp[Web Application]
    AppIcon --> OfflineCapable[Offline Capabilities]
    WebApp --> OnlineOnly[Online Only]

    OfflineCapable --> SyncWhenOnline[Sync When Online]
    OnlineOnly --> DirectSync[Direct Sync]

    SyncWhenOnline --> UserExperience[Enhanced UX]
    DirectSync --> UserExperience
```

## 🔧 Development Workflow

```mermaid
gitGraph
    commit id: "Initial Setup"
    branch frontend
    commit id: "Next.js Setup"
    commit id: "UI Components"
    commit id: "Authentication"

    checkout main
    branch backend
    commit id: "Express Setup"
    commit id: "Firebase Config"
    commit id: "API Endpoints"

    checkout main
    merge frontend
    merge backend
    commit id: "Integration Testing"

    branch features
    commit id: "Student Module"
    commit id: "Fee Module"
    commit id: "Hostel Module"
    commit id: "Exam Module"

    checkout main
    merge features
    commit id: "Production Deploy"
```

## 📈 Performance Optimization Flow

```mermaid
flowchart LR
    subgraph "Frontend Optimization"
        CodeSplit[Code Splitting]
        LazyLoad[Lazy Loading]
        Caching[Browser Caching]
        Compression[Asset Compression]
    end

    subgraph "Backend Optimization"
        APICache[API Caching]
        QueryOpt[Query Optimization]
        ConnPool[Connection Pooling]
        LoadBalance[Load Balancing]
    end

    subgraph "Database Optimization"
        Indexing[Database Indexing]
        Replication[Data Replication]
        Backup[Automated Backups]
        Monitoring[Performance Monitoring]
    end

    CodeSplit --> APICache
    LazyLoad --> QueryOpt
    Caching --> ConnPool
    Compression --> LoadBalance

    APICache --> Indexing
    QueryOpt --> Replication
    ConnPool --> Backup
    LoadBalance --> Monitoring
```