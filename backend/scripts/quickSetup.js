// Load environment variables
require('dotenv').config();

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
  }
];

async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    return response.data.success;
  } catch (error) {
    return false;
  }
}

async function createDemoUsers() {
  console.log('🚀 Setting up demo users...\n');

  // Check if server is running
  console.log('Checking server health...');
  const isServerRunning = await checkServerHealth();

  if (!isServerRunning) {
    console.error('❌ Backend server is not running!');
    console.log('Please start the backend server first:');
    console.log('  cd backend');
    console.log('  npm run dev');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  console.log('✅ Server is running\n');

  for (const userData of demoUsers) {
    try {
      console.log(`Creating user: ${userData.email}`);

      const response = await axios.post(`${API_BASE_URL}/users/register`, userData, {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500; // Accept 4xx errors (like user already exists)
        }
      });

      if (response.status === 201) {
        console.log(`✅ Successfully created: ${userData.email}`);
      } else if (response.status === 400 && response.data.message?.includes('already exists')) {
        console.log(`ℹ️  User already exists: ${userData.email}`);
      } else {
        console.log(`⚠️  Unexpected response for ${userData.email}:`, response.data.message);
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`❌ Cannot connect to server. Make sure backend is running on ${API_BASE_URL}`);
        break;
      } else {
        console.error(`❌ Error creating ${userData.email}:`, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n🎉 Demo users setup completed!');
  console.log('\n📝 You can now login at http://localhost:3000 with:');
  console.log('👨‍💼 Admin: admin@college.edu / admin123');
  console.log('🎓 Student: student@college.edu / student123');
}

createDemoUsers()
  .then(() => {
    console.log('\n✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });