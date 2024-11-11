/**
 * This code was adapted from Isaac's MERN Backend Video from the PROG6212 module.
 * Link to the original resource: [Isaac's MERN Backend Video]
 */
import ExpressBrute from 'express-brute';
import MongooseStore from 'express-brute-mongoose';
import mongoose from 'mongoose';

// Define the schema for brute force protection
const bruteforceSchema = new mongoose.Schema({
    _id: String,
    data: {
        count: Number,
        lastRequest: Date,
        firstRequest: Date
    },
    expires: { type: Date, index: { expires: "1h" } } // Set expiry time, e.g., 1 hour
});

// Create the model
const bruteforcemodel = mongoose.model("bruteforce", bruteforceSchema);

// Create the store
const store = new MongooseStore(bruteforcemodel);

// Create the brute force instance
const bruteForce = new ExpressBrute(store, {
    freeRetries: 2,
    minWait: 1 * 60 * 1000, // 1 minute
    maxWait: 2 * 60 * 1000, // 2 minutes
    failCallback: function (req, res, next, nextValidRequestDate) {
        res.status(429).json({
            message: "Too many failed attempts. Please retry later",
            nextValidRequestDate
        });
    }
});

// Export the brute force middleware
export default bruteForce;
