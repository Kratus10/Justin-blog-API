// db/connect.js

// Import Mongoose module
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Define the MongoDB connection URI
const DB_URI = process.env.DB_URI;

// Function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Connect to the database
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        // Log and handle any connection errors
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit the process with failure
    }
};

// Export the connectDB function to be used elsewhere in the application
module.exports = connectDB;
