import { RequestHandler } from "express";
import { LoginRequest, LoginResponse } from "@shared/api";

// Demo users - replace with real database and proper password hashing
const users = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // In production, use bcrypt hashing
    role: "administrator"
  },
  {
    id: "2", 
    username: "security",
    password: "secure456",
    role: "security_officer"
  }
];

// Simple JWT token simulation - use real JWT in production
const generateToken = (userId: string): string => {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password, rememberMe }: LoginRequest = req.body;
    
    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Username and password are required"
      };
      return res.status(400).json(response);
    }
    
    // Find user (in production, query database)
    const user = users.find(u => u.username === username);
    
    if (!user) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid username or password"
      };
      return res.status(401).json(response);
    }
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid username or password"
      };
      return res.status(401).json(response);
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      message: "Login successful"
    };
    
    // Log successful login
    console.log(`User ${username} logged in successfully at ${new Date().toISOString()}`);
    
    res.json(response);
    
  } catch (error) {
    console.error("Login error:", error);
    const response: LoginResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

export const verifyToken: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  const token = authHeader.substring(7);
  
  try {
    // In production, use proper JWT verification
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decoded.split(':');
    
    // Check if token is not older than 24 hours (or rememberMe period)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ error: "Token expired" });
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const logout: RequestHandler = (req, res) => {
  // In production, you might want to blacklist the token
  res.json({ message: "Logged out successfully" });
};
