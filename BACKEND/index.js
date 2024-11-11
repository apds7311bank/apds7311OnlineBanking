/*
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import './config.js'; // Load environment variables first
import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Correct import for mongoose
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import morgan from 'morgan';
import connectDB from './db/conn.js';
import authRoutes from './Routes/auth.js';
import paymentRoutes from './Routes/paymentRoutes.js';
import LoginAttemptLogger from './middleware/LoginAttemptLogger.js';
import xss from 'xss';
import passport from 'passport';
import configurePassport from './passport.js'; 
import session from 'express-session';
import rateLimit from 'express-rate-limit';

const app = express();
configurePassport(passport);
const PORT = process.env.PORT || 3001;

// Helper function to sanitize inputs
const sanitize = (input) => xss(input);

// Define rate limit configuration
const limiter = rateLimit({
    windowMs: 1 * 60 * 3000, // 1 minutes window
    max: 10, // Allow 100 requests per window
    message: `Too many requests from this IP,
   please try again later`,
});

//Connect to database
connectDB();

//Middleware
app.use(cors());
app.use(express.json());
// Configure helmet to include frameguard for clickjacking protection
app.use(helmet({
    frameguard: {
      action: 'SAMEORIGIN' // or 'DENY', based on your requirement
    }
  }));
  // Clickjacking Protection
app.use(helmet.frameguard({ action: 'deny' }));
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

 // Apply rate limiter to all routes
app.use(limiter); 
app.use(morgan('combined'));
app.use(LoginAttemptLogger)

//Routes
app.use('/api/auth', authRoutes);
app.use('/payments', paymentRoutes);

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict',
        maxAge: 30 * 60 * 1000 // 30 minutes session expiry
    }
}));

// Content Security Policy (CSP)
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    })
  );

app.use(passport.initialize());
app.use(passport.session());

// Middleware to enforce HTTPS
app.use((req, res, next) => {
    if (req.protocol === 'http') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
  
  // Custom middleware for logging login attempts (e.g., for brute-force protection)
  app.use(LoginAttemptLogger);
  

//SSL Certificate and key
const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
/*
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});*/