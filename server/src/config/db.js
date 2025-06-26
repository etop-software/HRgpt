// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
