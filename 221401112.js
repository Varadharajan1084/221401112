const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjE0MDExMTJAcmFqYWxha3NobWkuZWR1LmluIiwiZXhwIjoxNzUxNjk5MjE4LCJpYXQiOjE3NTE2OTgzMTgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5NjU5YTQ4OC1jODMyLTRiMDctYTg0Yi1kM2UwNWI4YzVjYjgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ2YXJhZGhhcmFqYW4iLCJzdWIiOiIzYjk0MmQyYS0yOGM1LTQ0Y2MtOTNhMS1mNzAwZDY2ZTAwMDUifSwiZW1haWwiOiIyMjE0MDExMTJAcmFqYWxha3NobWkuZWR1LmluIiwibmFtZSI6InZhcmFkaGFyYWphbiIsInJvbGxObyI6IjIyMTQwMTExMiIsImFjY2Vzc0NvZGUiOiJjV3lhWFciLCJjbGllbnRJRCI6IjNiOTQyZDJhLTI4YzUtNDRjYy05M2ExLWY3MDBkNjZlMDAwNSIsImNsaWVudFNlY3JldCI6ImZ5ZGNkZXhRQ2N3Qk1NQnoifQ.kAit7g66Ry9Ttwag7haCvImnDbkaDxCtxddvfPLtq4U';

async function Log(stack, level, pkg, message) {
  const url = 'http://20.244.56.144/evaluation-service/logs';
  const body = {
    stack,
    level,
    package: pkg,
    message
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error('Failed to log:', await response.text());
  } else {
    const data = await response.json();
    console.log('Log response:', data);
  }
}

Log('backend', 'error', 'handler', 'received string, expected bool');