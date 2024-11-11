/**
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import mongoose from "mongoose";
import LoginAttempt from '../models/LoginAttempt.js';

const LoginAttemptLogger = async(req, res, next) => {
    const originalJson = res.json.bind(res); // Ensure proper context

    res.json = function(data){
        const username = req.body.username;
        const ipAddress = req.id || req.connection.remoteAddress;
        const successfulLogin = !data.message || data.message != 'Invalid credentials';

        if (username) {
            LoginAttempt.create({ username, ipAddress, successfulLogin })
                .catch(err => console.error('Error logging login attempt:', err));
        } else {
            console.warn('Username not provided for logging login attempt');
        }

        return originalJson(data);
    };
    next();
}
export default LoginAttemptLogger;