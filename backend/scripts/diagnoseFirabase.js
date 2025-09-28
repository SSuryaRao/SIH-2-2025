// Load environment variables
require('dotenv').config();

const admin = require('firebase-admin');

async function diagnoseFirabase() {
  console.log('🔍 Firebase Configuration Diagnosis\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Present' : '❌ Missing');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Present' : '❌ Missing');

  if (process.env.FIREBASE_PRIVATE_KEY) {
    const keyStart = process.env.FIREBASE_PRIVATE_KEY.substring(0, 50);
    console.log('Private Key Start:', keyStart + '...');
    console.log('Contains newlines:', process.env.FIREBASE_PRIVATE_KEY.includes('\\n') ? '✅ Yes' : '❌ No');
  }
  console.log();

  try {
    // Test Firebase Admin initialization
    console.log('🚀 Testing Firebase Admin SDK initialization...');

    // Clear any existing apps
    admin.apps.forEach(app => app.delete());

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    console.log('Service Account Config:');
    console.log('- Project ID:', serviceAccount.projectId);
    console.log('- Client Email:', serviceAccount.clientEmail);
    console.log('- Private Key Format:', serviceAccount.privateKey ? 'Present and formatted' : 'Missing or malformed');
    console.log();

    // Initialize Firebase
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK initialized successfully');

    // Test Firestore connection
    console.log('🗄️  Testing Firestore connection...');
    const db = admin.firestore();
    await db.collection('_test').doc('_test').set({ test: true, timestamp: new Date() });
    await db.collection('_test').doc('_test').delete();
    console.log('✅ Firestore connection successful');

    // Test Firebase Auth
    console.log('🔐 Testing Firebase Auth...');
    const auth = admin.auth();

    // Try to list first user (this tests auth permissions)
    try {
      const listResult = await auth.listUsers(1);
      console.log('✅ Firebase Auth connection successful');
      console.log(`Found ${listResult.users.length} existing user(s)`);
    } catch (error) {
      console.log('⚠️  Firebase Auth connection issue:', error.message);
      if (error.code === 'auth/insufficient-permission') {
        console.log('💡 This might be a permissions issue with the service account');
      }
    }

    // Test user creation (then delete)
    console.log('🧪 Testing user creation...');
    try {
      const testUser = await auth.createUser({
        email: 'test@example.com',
        password: 'testpassword123',
        displayName: 'Test User'
      });
      console.log('✅ Test user created successfully');

      // Delete the test user
      await auth.deleteUser(testUser.uid);
      console.log('✅ Test user deleted successfully');
    } catch (error) {
      console.log('❌ User creation failed:', error.message);
      console.log('Error Code:', error.code);

      if (error.code === 'auth/project-not-found') {
        console.log('💡 Firebase project not found. Check your project ID.');
      } else if (error.code === 'auth/insufficient-permission') {
        console.log('💡 Service account lacks permissions. Check IAM roles.');
      } else if (error.code === 'auth/configuration-not-found') {
        console.log('💡 Firebase Authentication not enabled. Enable it in Firebase Console.');
      }
    }

  } catch (error) {
    console.log('❌ Firebase initialization failed:', error.message);
    console.log('Error Code:', error.code);

    if (error.message.includes('configuration corresponding to the provided identifier')) {
      console.log('\n💡 Possible Solutions:');
      console.log('1. Check if Firebase Authentication is enabled in Firebase Console');
      console.log('2. Verify your project ID is correct');
      console.log('3. Ensure the service account has proper permissions');
      console.log('4. Check if private key format is correct');
    }
  }

  console.log('\n🏁 Diagnosis completed');
}

diagnoseFirabase()
  .then(() => {
    console.log('\n✅ Diagnosis script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Diagnosis script failed:', error);
    process.exit(1);
  });