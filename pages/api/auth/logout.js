export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Clear the JWT token cookie
  const cookieOptions = [
    'token=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0', // Immediately expires the cookie
    'SameSite=Lax'
  ];

  // Add Secure flag for production (HTTPS)
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  res.status(200).json({ message: "Logged out successfully" });
} 