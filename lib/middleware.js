import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, callback) => {
  // Try to get token from Authorization header first
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no token in header, try to get from cookies
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    req.user = decoded;
    callback();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authenticateAndAuthorizeUser = (req, res, callback) => {
  authenticateToken(req, res, () => {
    const requestedUsername = req.query.username || req.body.username;
    
    if (req.user.username !== requestedUsername) {
      return res.status(403).json({ message: 'Access denied: You can only access your own data' });
    }
    
    callback();
  });
}; 