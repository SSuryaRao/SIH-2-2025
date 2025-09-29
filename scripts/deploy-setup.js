#!/usr/bin/env node

/**
 * Deployment Setup Script
 * Helps configure environment variables and check deployment readiness
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 College ERP Deployment Setup\n');

// Check if required files exist
const checkFiles = () => {
  console.log('📋 Checking deployment files...\n');

  const files = [
    'frontend/vercel.json',
    'frontend/.env.example',
    'backend/render.yaml',
    'backend/.env.example',
    'DEPLOYMENT.md'
  ];

  let allFilesExist = true;

  files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
};

// Check package.json configurations
const checkPackageConfigs = () => {
  console.log('\n📦 Checking package configurations...\n');

  // Check frontend package.json
  try {
    const frontendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'frontend', 'package.json')));
    console.log(`✅ Frontend: ${frontendPkg.name} v${frontendPkg.version}`);
    console.log(`   Build script: ${frontendPkg.scripts.build || 'NOT FOUND'}`);
    console.log(`   Start script: ${frontendPkg.scripts.start || 'NOT FOUND'}`);
  } catch (error) {
    console.log('❌ Frontend package.json - ERROR reading file');
  }

  // Check backend package.json
  try {
    const backendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backend', 'package.json')));
    console.log(`✅ Backend: ${backendPkg.name} v${backendPkg.version}`);
    console.log(`   Start script: ${backendPkg.scripts.start || 'NOT FOUND'}`);
    console.log(`   Node version: ${backendPkg.engines?.node || 'NOT SPECIFIED'}`);
  } catch (error) {
    console.log('❌ Backend package.json - ERROR reading file');
  }
};

// Generate deployment checklist
const generateChecklist = () => {
  console.log('\n📝 Deployment Checklist:\n');

  const checklist = [
    '□ GitHub repository is connected to Vercel',
    '□ GitHub repository is connected to Render',
    '□ Firebase project is created and configured',
    '□ Environment variables are set in Vercel dashboard',
    '□ Environment variables are set in Render dashboard',
    '□ Firebase service account key is added to backend env vars',
    '□ CORS configuration includes production URLs',
    '□ Frontend build and start commands are working',
    '□ Backend health check endpoint (/api/health) is accessible',
    '□ Database connections are working in production',
    '□ Custom domains are configured (if applicable)',
    '□ SSL certificates are properly set up',
    '□ Monitoring and logging are configured'
  ];

  checklist.forEach(item => console.log(item));

  console.log('\n💡 For detailed instructions, see DEPLOYMENT.md');
};

// Show environment variable templates
const showEnvTemplates = () => {
  console.log('\n🔧 Environment Variable Templates:\n');

  console.log('Frontend (.env for Vercel):');
  console.log('NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com\n');

  console.log('Backend (.env for Render):');
  console.log('NODE_ENV=production');
  console.log('PORT=10000');
  console.log('HOST=0.0.0.0');
  console.log('FRONTEND_URL=https://your-frontend-url.vercel.app');
  console.log('FIREBASE_PROJECT_ID=your-project-id');
  console.log('FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.log('JWT_SECRET=your-super-long-random-secret-key');
  console.log('JWT_EXPIRE=7d');
};

// Main execution
const main = () => {
  const filesExist = checkFiles();
  checkPackageConfigs();
  generateChecklist();
  showEnvTemplates();

  if (filesExist) {
    console.log('\n🎉 All deployment files are ready!');
    console.log('📖 Follow the steps in DEPLOYMENT.md to deploy your application.');
  } else {
    console.log('\n⚠️  Some deployment files are missing.');
    console.log('🔧 Please run the deployment configuration again.');
  }
};

main();