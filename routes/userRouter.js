// routes/userRouter.js

// Import necessary modules
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes for user operations

// Route for user sign-up
router.post('/signup', userController.signUp);

// Route for user login
router.post('/login', userController.login);

// Export the router
module.exports = router;
