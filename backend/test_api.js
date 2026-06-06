const fetch = require('node-fetch');
async function run() {
  // Login first to get token
  let res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=admin%40vendorbridge.com&password=AdminPassword123!'
  });
  let data = await res.json();
  let token = data.access_token;
  
  // Try to add user
  let addRes = await fetch('http://127.0.0.1:8000/api/v1/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: 'test4@test.com',
      phone: '',
      role_id: '123e4567-e89b-12d3-a456-426614174000', // random uuid
      password: 'password123',
      is_active: true
    })
  });
  console.log(await addRes.text());
}
run();
