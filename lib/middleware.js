import { verify } from "jsonwebtoken";

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from Authorization header
 */
export function authenticateToken(handler) {
  return async (req, res) => {
    try {
      // Extract token from Authorization header or cookies
      const authHeader = req.headers.authorization;
      let token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      // If no Authorization header, check cookies
      if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.token;
      }

      if (!token) {
        return res.status(401).json({ 
          error: "Access denied. No token provided.",
          message: "Please provide a valid JWT token in the Authorization header or cookies" 
        });
      }

      // Verify the token
      const decoded = verify(token, process.env.NEXTAUTH_SECRET);
      
      // Add user info to request object
      req.user = decoded;
      
      // Call the original handler
      return handler(req, res);
      
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Token expired",
          message: "Your session has expired. Please log in again." 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: "Invalid token",
          message: "The provided token is invalid." 
        });
      }
      
      return res.status(401).json({ 
        error: "Authentication failed",
        message: "Token verification failed." 
      });
    }
  };
}

/**
 * Optional: Middleware that also checks if the authenticated user matches the requested username
 */
export function authenticateAndAuthorizeUser(handler) {
  return authenticateToken(async (req, res) => {
    const requestedUsername = req.body?.username || req.query?.username;
    
    if (requestedUsername && req.user.username !== requestedUsername) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "You can only access your own data." 
      });
    }
    
    return handler(req, res);
  });
} 