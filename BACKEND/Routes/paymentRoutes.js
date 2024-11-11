/*
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import express from 'express';
import { body, validationResult } from 'express-validator'; // Importing express-validator
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import bruteForce from '../middleware/bruteforceprotectionmiddleware.js'; // Brute force protection
import sanitize from 'sanitize-html';
import authMiddleware from '../middleware/authMiddleware.js'


// Initialize the router
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const allowedCurrencies = ['USD', 'EUR', 'ZAR', 'GBP', 'INR'];
const allowedProviders = ['Stripe', 'Square', 'Paypal']; // Removed 'PayPal'


// Function to validate SWIFT code
function validateSwiftCode(swiftCode) {
    // Basic validation: Check if it's 8 or 11 characters long and follows the format
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);
  }
  
  
  // Add a new payment
  router.post("/add", bruteForce.prevent, // Ensure this is a valid middleware function
    [
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
        body('currency').isIn(allowedCurrencies).withMessage(`Currency must be one of: ${allowedCurrencies.join(', ')}`),
        body('provider').isIn(allowedProviders).withMessage(`Provider must be one of: ${allowedProviders.join(', ')}`),
        body('accountNumber').trim().escape().isAlphanumeric().withMessage('Account number must be alphanumeric')
    ],
    async (req, res) => {
    const { amount, accountNumber, swiftCode, currency, provider } = req.body;
  
    // Create a new payment instance
    const newPayment = new Payment({
      amount,
      accountNumber,
      swiftCode,
      currency,
      provider,
    });
  
    try {
      // Save the new payment to the database
      await newPayment.save();
      res.status(201).json({ message: "Payment added successfully", payment: newPayment });
    } catch (error) {
      console.error("Error adding payment:", error);
      // Check for duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ message: "Account number must be unique" });
      }
      res.status(500).json({ message: "Error adding payment", error: error.message });
    }
  });
  
  
  // Delete a payment by ID
  router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const payment = await Payment.findByIdAndDelete(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json({ message: "Payment deleted successfully", payment });
    } catch (error) {
      res.status(400).json({ message: "Error deleting payment", error });
    }
  });
  // Update payment by ID with input validation
  router.put("/edit/:id", 
    [
        body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
        body('currency').optional().isIn(allowedCurrencies).withMessage(`Currency must be one of: ${allowedCurrencies.join(', ')}`),
        body('provider').optional().isIn(allowedProviders).withMessage(`Provider must be one of: ${allowedProviders.join(', ')}`)
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  
        const { amount, currency, provider } = req.body;
        const updateFields = {};
        if (amount) updateFields.amount = amount;
        if (currency) updateFields.currency = currency;
        if (provider) updateFields.provider = provider;
  
        try {
            const updatedPayment = await Payment.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true }
            );
            if (!updatedPayment) {
                return res.status(404).json({ message: "Payment not found." });
            }
            res.json({ message: "Payment updated", updatedPayment });
        } catch (err) {
            console.error("Error updating payment", err);
            res.status(500).json({ message: "Server error", error: err });
        }
  });
  // Update payment by ID with input validation
  router.put("edit/:id", 
      [
          body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
          body('currency').optional().isIn(allowedCurrencies).withMessage(`Currency must be one of: ${allowedCurrencies.join(', ')}`),
          body('provider').optional().isIn(allowedProviders).withMessage(`Provider must be one of: ${allowedProviders.join(', ')}`)
      ],
      async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
          }
  
          const { amount, currency, provider } = req.body;
          const updateFields = {};
          if (amount) updateFields.amount = amount;
          if (currency) updateFields.currency = currency;
          if (provider) updateFields.provider = provider;
  
          try {
              const updatedPayment = await Payment.findByIdAndUpdate(
                  req.params.id,
                  updateFields,
                  { new: true }
              );
              if (!updatedPayment) {
                  return res.status(404).json({ message: "Payment not found." });
              }
              res.json({ message: "Payment updated", updatedPayment });
          } catch (err) {
              console.error("Error updating payment", err);
              res.status(500).json({ message: "Server error", error: err });
          }
  });
  
  
  // View all payments
  router.get("/view", async (req, res) => {
    try {
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (error) {
      res.status(400).json({ message: "Error retrieving payments", error });
    }
  });
  
  router.get("/view/:id", async (req, res) => {
    try {
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (error) {
      res.status(400).json({ message: "Error retrieving payments", error });
    }
  });
  
  router.post("/submit/:id", async (req, res) => {
    const { id } = req.params;
    const { swiftCode } = req.body;
  
    // Validate the SWIFT code
    const isValidSwiftCode = validateSwiftCode(swiftCode);
  
    if (!isValidSwiftCode) {
      try {
        // Find the payment and set the status to "cancelled" if invalid SWIFT code
        const payment = await Payment.findById(id);
        if (!payment) {
          return res.status(404).json({ message: "Payment not found" });
        }
  
        payment.status = "cancelled";
        await payment.save();
  
        return res.status(400).json({ message: "Invalid SWIFT code", payment });
      } catch (error) {
        console.error("Error handling invalid SWIFT code:", error);
        return res.status(500).json({ message: "Error submitting payment", error: error.message });
      }
    }
  
    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
  
      // Check if payment is already processed
      const processedStatuses = [ "cancelled", "submitted"];
      if (!processedStatuses.includes(payment.status)) {
        return res.status(400).json({ message: "Payment has already been processed" });
      }
  
      // Update status to processing
      payment.status = "processing";
      await payment.save();
  
      // Simulate payment processing logic
      const paymentResult = await processPayment(payment);
  
      // Update the payment status based on the result
      if (paymentResult.success) {
        payment.status = "submitted"; // Payment was successful
      } else {
        payment.status = "cancelled"; // Payment failed
        payment.errorMessage = paymentResult.error; // Store error message
      }
  
      await payment.save();
      res.status(200).json({ message: "Payment submitted successfully", payment });
    } catch (error) {
      console.error("Error submitting payment:", error);
      res.status(500).json({ message: "Error submitting payment", error: error.message || error });
    }
  });
  // Route to view payments added by the logged-in user
router.get("/mypayments", authMiddleware, async (req, res) => {
  try {
    // Extract user ID from the authenticated request
    const userId = req.user.id;

    // Find payments associated with the logged-in user
    const userPayments = await Payment.find({ userId });

    if (userPayments.length === 0) {
      return res.status(404).json({ message: "No payments found for this user" });
    }

    res.status(200).json(userPayments);
  } catch (error) {
    console.error("Error retrieving user payments:", error);
    res.status(500).json({ message: "Error retrieving payments", error: error.message });
  }
});

  
export default router;
