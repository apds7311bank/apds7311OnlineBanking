/*
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import { Router } from "express";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({ 
    fullname: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9_ ]+$/, 'Only alphanumeric characters and underscores'] 
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Only alphanumeric characters and underscores'] 
    },
    idnumber: {
        type: String, // Changed from Number to String
        required: true,
        unique: true
    },
    accountnumber: {
        type: String, // Changed from Number to String
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: { 
        type: String, 
        enum: ['customer', 'admin'], 
        default: 'customer' 
    }
});

export default mongoose.model('User', userSchema);