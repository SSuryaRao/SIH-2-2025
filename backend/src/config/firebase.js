const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      return admin.app();
    }

    console.log('Initializing Firebase Admin SDK...');

    let credential;

    // Method 1: Use service account key file (most reliable)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      console.log('Using service account file:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      credential = admin.credential.cert(serviceAccount);
    }
    // Method 2: Try using the JSON file directly from credentials folder
    else {
      try {
        const path = require('path');
        const credentialsPath = path.join(__dirname, '../../credentials/sih-2-2025-firebase-adminsdk-fbsvc-b4a87e598e.json');
        console.log('Trying direct service account file:', credentialsPath);
        const serviceAccount = require(credentialsPath);
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        console.log('Service account file not found, trying environment variables...');

        // Method 3: Use environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
          console.log('Using environment variables for Firebase configuration');

          const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

          credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
          });
        } else {
          throw new Error('Firebase configuration not found. Please set up service account file or environment variables.');
        }
      }
    }

    // Initialize Firebase app
    const app = admin.initializeApp({
      credential: credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'sih-2-2025'
    });

    console.log('Firebase Admin SDK initialized successfully');
    console.log('Project ID:', app.options.projectId);

    return app;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);

    if (error.message.includes('configuration corresponding to the provided identifier')) {
      console.error('\n💡 Possible solutions:');
      console.error('1. Enable Firebase Authentication in Firebase Console');
      console.error('2. Check your Firebase project ID');
      console.error('3. Verify service account permissions');
      console.error('4. Run: npm run diagnose');
    }

    throw error; // Don't exit immediately, let the calling code handle it
  }
};

// Get Firestore instance
const getFirestore = () => {
  const app = initializeFirebase();
  return admin.firestore();
};

// Get Firebase Auth instance
const getAuth = () => {
  const app = initializeFirebase();
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  admin
};