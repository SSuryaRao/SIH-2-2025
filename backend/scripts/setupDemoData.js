// Load environment variables
require('dotenv').config({ path: '../.env' });

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

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

async function createDemoUsers() {
  console.log('🚀 Creating demo users via API...');
  console.log('Make sure your backend server is running on http://localhost:5000\n');

  for (const userData of demoUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);

      const response = await axios.post(`${API_BASE_URL}/users/register`, userData);

      if (response.data.success) {
        console.log(`✅ Created user: ${userData.email}`);

        // If it's a student, create additional student data
        if (userData.role === 'student') {
          try {
            const token = response.data.data.token;
            const studentData = {
              personalInfo: {
                name: userData.name,
                email: userData.email,
                phone: '9876543210',
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
                admissionDate: '2022-08-01'
              }
            };

            await axios.post(`${API_BASE_URL}/students`, studentData, {
              headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ Created student record for: ${userData.email}`);
          } catch (error) {
            console.log(`⚠️  Could not create student record: ${error.response?.data?.message || error.message}`);
          }
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      if (message.includes('already exists')) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating user ${userData.email}: ${message}`);
      }
    }
  }

  console.log('\n🎉 Demo users setup completed!');
  console.log('\n📝 Demo Credentials:');
  console.log('Admin: admin@college.edu / admin123');
  console.log('Student: student@college.edu / student123');
  console.log('Staff: staff@college.edu / staff123');
  console.log('Warden: warden@college.edu / warden123');
  console.log('\n🌐 You can now login at: http://localhost:3000');
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nMake sure your backend server is running: npm run dev');
    process.exit(1);
  });