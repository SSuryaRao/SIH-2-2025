// Load environment variables
require('dotenv').config();

const { dbHelpers, collections } = require('../src/config/database');
const { hashPassword, generateUniqueId } = require('../src/utils/auth');

async function createUsersDirectly() {
  console.log('🚀 Creating users directly in Firestore (bypassing Firebase Auth)...\n');

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

  try {
    // Initialize Firebase and test connection
    const { initializeFirebase } = require('../src/config/firebase');
    initializeFirebase();
    console.log('✅ Firebase connection established\n');

    for (const userData of demoUsers) {
      try {
        console.log(`Creating user: ${userData.email}`);

        // Generate a unique user ID
        const userId = generateUniqueId('USER');

        // Hash password
        const hashedPassword = await hashPassword(userData.password);

        // Create user document directly in Firestore
        const userDoc = {
          uid: userId, // Use our generated ID instead of Firebase Auth UID
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isActive: true,
          profile: userData.profile || {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Check if user already exists
        const existingUsers = await dbHelpers.getDocuments(collections.USERS, [
          { field: 'email', operator: '==', value: userData.email }
        ]);

        if (existingUsers.length > 0) {
          console.log(`ℹ️  User already exists: ${userData.email}`);
          continue;
        }

        await dbHelpers.setDocument(collections.USERS, userId, userDoc);
        console.log(`✅ Created user in Firestore: ${userData.email}`);

        // If it's a student, create a student record as well
        if (userData.role === 'student') {
          const studentDoc = {
            studentId: `STU${Date.now()}`,
            userId: userId,
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
    console.log('\n📝 Demo Credentials (Firestore only):');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Student: student@college.edu / student123');
    console.log('Staff: staff@college.edu / staff123');
    console.log('Warden: warden@college.edu / warden123');
    console.log('\n⚠️  Note: These users are created only in Firestore, not in Firebase Auth');
    console.log('This bypasses Firebase Auth issues and allows you to test the login system');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your .env file has correct Firebase credentials');
    console.log('2. Check if Firestore is enabled in your Firebase project');
    console.log('3. Try running: npm run diagnose');
  }
}

createUsersDirectly()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });