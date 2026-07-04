async function testRegister() {
  const url = 'https://ai-event-planner-0f08.onrender.com/api/register';
  const email = `test_live_${Date.now()}@example.com`;
  const payload = {
    name: 'Live Test User',
    email: email,
    password: 'password123'
  };

  console.log(`Sending POST to ${url} with email: ${email}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response body:', data);

    if (res.ok && data.token) {
      console.log('Registration succeeded! Testing profile connection with token...');
      const profileUrl = 'https://ai-event-planner-0f08.onrender.com/api/profile';
      const profRes = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      console.log('Profile Response status:', profRes.status);
      const profData = await profRes.json();
      console.log('Profile Response body:', profData);

      console.log('Testing notifications connection with token...');
      const notifUrl = 'https://ai-event-planner-0f08.onrender.com/api/notifications';
      const notifRes = await fetch(notifUrl, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      console.log('Notifications Response status:', notifRes.status);
      const notifData = await notifRes.json();
      console.log('Notifications Response body:', notifData);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testRegister();
