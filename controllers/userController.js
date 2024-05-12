// controllers/userController.js

// Import necessary modules
const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Controller functions for user operations

// User sign-up controller
exports.signUp = async (req, res) => {
    try {
        // Extract user data from request body
        const { first_name, last_name, email, password, country } = req.body;

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }

        // Create a new user instance
        const newUser = new User({ first_name, last_name, email, password, country });

        // Save the user to the database
        await newUser.save();

        // Generate JWT token for authentication
        const token = jwt.sign({ email: newUser.email, userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return success response with token
        return res.status(201).json({ message: 'User signed up successfully!', token });
    } catch (error) {
        // Handle errors
        console.error('Error in user sign-up:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// User login controller
exports.login = async (req, res) => {
    try {
        // Extract user credentials from request body
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // If user not found
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed. Email or password is incorrect.' });
        }

        // Validate user password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Authentication failed. Email or password is incorrect.' });
        }

        // Generate JWT token for authentication
        const token = jwt.sign({ email: user.email, userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return success response with token
        return res.status(200).json({ message: 'Authentication successful!', token });
    } catch (error) {
        // Handle errors
        console.error('Error in user login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
