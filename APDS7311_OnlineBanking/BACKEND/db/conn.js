import mongoose from "mongoose";

const ATLAS_URI = process.env.ATLAS_URI

const connectDB = async () => {
    
    console.log('Attempting to connect to ATLAS_URI...');
    try {
            await mongoose.connect(ATLAS_URI);
            console.log(`MongoDB connected to ${ATLAS_URI}`);
    } catch (err) {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        }
    
};

export default connectDB;