// Debug script to check authentication state
// Run this in browser console on any page

console.log('=== Authentication Debug ===');
console.log('Cookie token:', document.cookie.includes('auth-token') ? 'EXISTS' : 'NOT FOUND');
console.log('LocalStorage token:', localStorage.getItem('auth-token') ? 'EXISTS' : 'NOT FOUND');

// Show actual values (be careful with this in production)
console.log('Cookie value:', document.cookie.split(';').find(c => c.trim().startsWith('auth-token=')));
console.log('LocalStorage value:', localStorage.getItem('auth-token'));

// Test API call with current authentication
fetch('/api/students/my-details')
  .then(response => {
    console.log('API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API Response Data:', data);
  })
  .catch(error => {
    console.log('API Error:', error);
  });