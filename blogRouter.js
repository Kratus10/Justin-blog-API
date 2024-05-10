// Import necessary modules
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middlewares/auth');

// Define routes for blogs

// Create a new blog (requires authentication)
router.post('/', authMiddleware.authenticateUser, blogController.createBlog);

// Publish a blog (requires authentication and owner role)
router.put('/:id/publish', authMiddleware.authenticateUser, authMiddleware.checkOwnerRole, blogController.publishBlog);

// Delete a blog (requires authentication and ownership)
router.delete('/:id', authMiddleware.authenticateUser, blogController.deleteBlog);

// Update a blog (requires authentication and ownership)
router.put('/:id', authMiddleware.authenticateUser, blogController.updateBlog);

// Retrieve a single blog
router.get('/:id', blogController.getBlog);

// Retrieve a list of blogs
router.get('/', blogController.getAllBlogs);

module.exports = router;
