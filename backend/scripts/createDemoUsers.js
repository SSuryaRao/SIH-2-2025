// Load environment variables
require('dotenv').config();

const { initializeFirebase } = require('../src/config/firebase');
const { dbHelpers, collections } = require('../src/config/database');
const { hashPassword } = require('../src/utils/auth');
const { getAuth } = require('../src/config/firebase');

// Initialize Firebase
initializeFirebase();
const auth = getAuth();

async function createDemoUsers() {
  console.log('Creating demo users...');

  const demoUsers = [
    {
      email: 'admin@college.edu',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      profile: {
        department: 'Administration',
        designation: 'System Administrator'
      }
    },
    {
      email: 'student@college.edu',
      password: 'student123',
      name: 'Demo Student',
      role: 'student',
      profile: {
        phone: '9876543210'
      }
    },
    {
      email: 'staff@college.edu',
      password: 'staff123',
      name: 'Academic Staff',
      role: 'staff',
      profile: {
        department: 'Computer Science',
        designation: 'Assistant Professor'
      }
    },
    {
      email: 'warden@college.edu',
      password: 'warden123',
      name: 'Hostel Warden',
      role: 'warden',
      profile: {
        department: 'Hostel Management',
        designation: 'Chief Warden'
      }
    }
  ];

  for (const userData of demoUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);

      // Check if user already exists in Firebase Auth
      let firebaseUser;
      try {
        firebaseUser = await auth.getUserByEmail(userData.email);
        console.log(`Firebase user already exists: ${userData.email}`);
      } catch (error) {
        // User doesn't exist, create new one
        firebaseUser = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name
        });
        console.log(`Created Firebase user: ${userData.email}`);
      }

      // Check if user already exists in Firestore
      const existingUser = await dbHelpers.getDocument(collections.USERS, firebaseUser.uid);

      if (existingUser) {
        console.log(`Firestore user already exists: ${userData.email}`);
        continue;
      }

      // Hash password for our database
      const hashedPassword = await hashPassword(userData.password);

      // Create user document in Firestore
      const userDoc = {
        uid: firebaseUser.uid,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        isActive: true,
        profile: userData.profile || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await dbHelpers.setDocument(collections.USERS, firebaseUser.uid, userDoc);
      console.log(`✅ Created user in Firestore: ${userData.email}`);

      // If it's a student, create a student record as well
      if (userData.role === 'student') {
        const studentDoc = {
          studentId: `STU${Date.now()}`,
          userId: firebaseUser.uid,
          personalInfo: {
            name: userData.name,
            email: userData.email,
            phone: userData.profile.phone || '9876543210',
            dateOfBirth: '2000-01-15',
            gender: 'male',
            address: {
              permanent: '123 Main St, City, State, 12345',
              current: 'College Hostel Room 101'
            }
          },
          academicInfo: {
            course: 'CSE',
            branch: 'Computer Science Engineering',
            semester: 3,
            year: 2,
            rollNumber: 'CSE2022001',
            admissionDate: '2022-08-01',
            status: 'active'
          },
          documents: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const studentId = studentDoc.studentId;
        await dbHelpers.setDocument(collections.STUDENTS, studentId, studentDoc);
        console.log(`✅ Created student record: ${studentId}`);
      }

    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Demo users creation completed!');
  console.log('\n📝 Demo Credentials:');
  console.log('Admin: admin@college.edu / admin123');
  console.log('Student: student@college.edu / student123');
  console.log('Staff: staff@college.edu / staff123');
  console.log('Warden: warden@college.edu / warden123');
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });