
/*
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
// models/payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be a positive value'], // Validation for positive amounts
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  swiftCode: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'ZAR', 'GBP', 'INR'], // Only allow supported currencies
  },
  provider: {
    type: String,
    required: true,
    enum: ["PayPal", "Square", "Stripe"], // Only allow PayPal and Skrill
    message: '{VALUE} is not supported as a provider'
  },
  status: {
    type: String,
    enum: [
        "pending",
        "submitted",
        "processing",
        "cancelled",
        
    ],
    default: "pending", // Set default status to pending
},
errorMessage: String,
});

export default mongoose.model("Payment", paymentSchema);


