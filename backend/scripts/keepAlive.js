#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Free Tier
 * This script pings the backend health check endpoint to prevent the service from sleeping
 */

const https = require('https');
const http = require('http');

// Get the backend URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;

if (!BACKEND_URL) {
  console.error('❌ Error: BACKEND_URL or RENDER_EXTERNAL_URL not set');
  process.exit(1);
}

// Parse the URL
const url = new URL(`${BACKEND_URL}/api/health`);
const protocol = url.protocol === 'https:' ? https : http;

console.log(`🔔 Pinging: ${url.href}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

// Make the request
const request = protocol.get(url.href, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Keep-alive ping successful');
      try {
        const response = JSON.parse(data);
        console.log('📊 Response:', response);
      } catch (e) {
        console.log('📊 Response:', data);
      }
      process.exit(0);
    } else {
      console.error(`❌ Ping failed with status code: ${res.statusCode}`);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

request.on('error', (error) => {
  console.error('❌ Keep-alive ping failed:', error.message);
  process.exit(1);
});

// Set a timeout for the request
request.setTimeout(30000, () => {
  console.error('❌ Request timeout after 30 seconds');
  request.destroy();
  process.exit(1);
});
