/*
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema({ 
  username: {
   type: String,
   required: true,
   immutable: true,
   trim: true,
   match: [/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores'] 
  },
  
  ipAddress: {
    type: String,
    required: true,
    immutable: true,
   },
  successfulLogin: {
    type: Boolean,
    required: true,
    immutable: true,
   },
  timestamp: { 
    type: Date, 
    default: Date.now,
    immutable: true 
  } 
})

export default mongoose.model("LoginAttempt", loginAttemptSchema);