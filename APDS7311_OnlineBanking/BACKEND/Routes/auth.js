/**
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */

import express from 'express';
import expressBrute from 'express-brute';
import bcrypt from 'bcrypt'; //hash password
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Importing authMiddleware
import LoginAttemptLogger from '../middleware/LoginAttemptLogger.js'; // Importing LoginAttemptLogger
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bruteForce from '../middleware/bruteforceprotectionmiddleware.js';
import xss from 'xss';
import mongoose from 'mongoose';
import passport from 'passport';
import { checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET ; // Set a default in case env var is not set
const sanitize = (input) => xss(input); 
const store = new expressBrute.MemoryStore(); // Store can be MemoryStore or any other store you choose


const createAdminUsers = async () => {
  const admins = [
    { username: 'admin1', password: 'Abcd@1234', role: 'admin', accountnumber: '123456', idnumber: 'ID001', fullname: 'Admin One' },
    { username: 'admin2', password: 'XyZ987@q', role: 'admin', accountnumber: '654321', idnumber: 'ID002', fullname: 'Admin Two' }
  ];

  for (const admin of admins) {
    try {
      const existingAdmin = await User.findOne({ username: admin.username });
      console.log(`Checking if ${admin.username} exists:`, existingAdmin);
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const newAdmin = new User({
          username: admin.username,
          password: hashedPassword,
          role: admin.role,
          accountnumber: admin.accountnumber,
          idnumber: admin.idnumber,
          fullname: admin.fullname
        });
        await newAdmin.save();
        console.log(`Admin ${admin.username} created.`);
      } else {
        console.log(`Admin ${admin.username} already exists.`);
      }
    } catch (err) {
      console.error(`Error creating admin ${admin.username}:`, err);
    }
  }
};

// Do not close the connection prematurely
createAdminUsers().then(() => {
  console.log('Admin users setup completed.');
  // mongoose.connection.close(); Uncomment only when sure all operations complete
}).catch((err) => {
  console.error('Error creating admin users:', err);
});

// Home route
router.get('/', (req, res) => {
    res.send('Welcome to the International Banking');
});

// Registration using fullname, username, account number, id number, and password
router.post(
  '/register',
  [
    // Validate inputs
    body('fullname').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
    body('username').isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    body('accountnumber').isNumeric().withMessage('Account number must be numeric'),
    body('idnumber').isLength({ min: 6 }).withMessage('ID number must be at least 6 characters long'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res) => {
    try {
      // Sanitize all incoming input
      const sanitizedBody = {
        fullname: sanitize(req.body.fullname),
        username: sanitize(req.body.username),
        accountnumber: sanitize(req.body.accountnumber),
        idnumber: sanitize(req.body.idnumber),
        password: sanitize(req.body.password)
      };

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if the username, account number, or ID number already exists
      const existingUser = await User.findOne({
        $or: [
          { username: sanitizedBody.username },
          { accountnumber: sanitizedBody.accountnumber },
          { idnumber: sanitizedBody.idnumber }
        ]
      });

      if (existingUser) {
        if (existingUser.username === sanitizedBody.username) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        if (existingUser.accountnumber === sanitizedBody.accountnumber) {
          return res.status(400).json({ message: 'Account number already exists' });
        }
        if (existingUser.idnumber === sanitizedBody.idnumber) {
          return res.status(400).json({ message: 'ID number already exists' });
        }
      }

      // Hash the password using bcrypt
      const saltRounds = 10;  // You can adjust the cost factor
      const hashedPassword = await bcrypt.hash(sanitizedBody.password, saltRounds);

      // Create a new user
      const newUser = new User({
        fullname: sanitizedBody.fullname,
        username: sanitizedBody.username,
        accountnumber: sanitizedBody.accountnumber,
        idnumber: sanitizedBody.idnumber,
        password: hashedPassword,  // Store the hashed password
        role: 'customer'  // Assign the default role
      });

      await newUser.save();

      return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }
);

// Sanitize input for login routes 
router.post('/login', bruteForce.prevent, LoginAttemptLogger, async (req, res) => {
    try {
      const sanitizedUsername = sanitize(req.body.username);
      const sanitizedAccountNumber = sanitize(req.body.accountnumber);
      const sanitizedPassword = sanitize(req.body.password);
  
        // Validate inputs
      if (!sanitizedUsername || !sanitizedAccountNumber || !sanitizedPassword) {
        return res.status(400).json({ message: 'Please fill in all fields' });
      }


        // Find the user by username
        const user = await User.findOne({ username : sanitizedUsername });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (username)' });
        }

        // Check the password
        const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (password)' });
        }

        // Check the account number
        const userAccountNumber = String(user.accountnumber);  // Convert stored account number to string
        const inputAccountNumber = String(sanitizedAccountNumber);  // Convert input account number to string

        if (userAccountNumber !== inputAccountNumber) {
            return res.status(400).json({ message: 'Invalid credentials (account number)' });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Admin login route
router.post(
  '/adminlogin',
  [
    body('username').matches(/^admin[0-9]+$/).withMessage('Invalid admin username format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  (req, res, next) => {
    // Sanitize inputs
    const sanitizedUsername = sanitize(req.body.username);
    const sanitizedPassword = sanitize(req.body.password);

    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Authenticate admin user using Passport's local strategy
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({ message: info ? info.message : 'Invalid credentials' });
      }

      // Ensure the user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: not an admin' });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in' });
        }

        // Create a JWT token for the admin
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
      });
    })(req, res, next);
  });

export default router;
