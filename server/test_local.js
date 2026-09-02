async function testLocalApi() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@codeflow.com', password: 'password123' })
  });
  const { token } = await loginRes.json();

  const coursesRes = await fetch('http://localhost:3001/api/courses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const courses = await coursesRes.json();
  console.log('Total local courses:', courses.length);
  const enrolled = courses.filter(c => c.enrolled);
  console.log('Enrolled courses:', enrolled.length);
  for (const c of enrolled) {
    console.log(`- ${c.title} (${c.language}, ${c.level})`);
  }
}

testLocalApi().catch(console.error);
