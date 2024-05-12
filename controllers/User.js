// models/user.js

// Import necessary modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const shortid = require('shortid');

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate // Generate unique ID using shortid
    },
    first_name: { type: String, required: true }, // First name of the user
    last_name: { type: String, required: true }, // Last name of the user
    email: {
        type: String,
        required: true,
        unique: true, // Email should be unique
        validate: {
            // Validate email format using regular expression
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: { type: String, required: true }, // Password of the user
    country: { type: String, required: true }, // Country of the user
    profilePicture: { type: String } // Profile picture URL (optional)
});

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    // Hash the password with bcrypt
    const hash = await bcrypt.hash(user.password, 10);
    this.password = hash; // Set the hashed password
    next(); // Proceed to save
});

// Method to validate user password
userSchema.methods.isValidPassword = async function (password) {
    const user = this;
    // Compare input password with hashed password
    const compare = await bcrypt.compare(password, user.password);
    return compare; // Return true if passwords match, false otherwise
};

// Define the User model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
