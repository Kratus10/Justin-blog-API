// Import necessary modules
const Blog = require('../models/blog');

// Controller functions for blog operations

// Create a new blog
exports.createBlog = async (req, res) => {
    try {
        // Extract blog data from request body
        const { title, description, tags, body } = req.body;

        // Create a new blog instance with additional fields
        const newBlog = new Blog({
            title,
            description,
            tags,
            author: req.user._id, // Assign the author ID from authenticated user
            timestamp: Date.now(),
            state: 'draft', // Set initial state to 'draft'
            read_count: 0, // Initialize read count to 0
            reading_time: calculateReadingTime(body), // Calculate reading time
            body
        });

        // Save the blog to the database
        await newBlog.save();

        // Return success response
        return res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        // Handle errors
        console.error('Error creating blog:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update the state of a blog from draft to published
exports.publishBlog = async (req, res) => {
    try {
        // Extract blog ID from request parameters
        const { id } = req.params;

        // Find the blog by ID
        const blog = await Blog.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the authenticated user is the owner of the blog website
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'You are not authorized to publish blogs' });
        }

        // Change the state of the blog to published
        blog.state = 'published';

        // Save the updated blog
        await blog.save();

        // Return success response
        return res.status(200).json({ message: 'Blog published successfully', blog });
    } catch (error) {
        // Handle errors
        console.error('Error publishing blog:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
    try {
        // Extract blog ID from request parameters
        const { id } = req.params;

        // Find the blog by ID
        const blog = await Blog.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the authenticated user is the author of the blog
        if (blog.author.toString() !== req.user._id && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'You are not authorized to delete this blog' });
        }

        // Delete the blog from the database
        await blog.remove();

        // Return success response
        return res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting blog:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a blog
exports.updateBlog = async (req, res) => {
    try {
        // Extract blog ID from request parameters
        const { id } = req.params;

        // Find the blog by ID
        let blog = await Blog.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the authenticated user is the owner of the blog website or the author of the blog
        if (req.user.role !== 'owner' && blog.author.toString() !== req.user._id) {
            return res.status(403).json({ message: 'You are not authorized to update this blog' });
        }

        // Extract updated blog data from request body
        const { title, description, tags, body } = req.body;

        // Update the blog fields
        blog.title = title;
        blog.description = description;
        blog.tags = tags;
        blog.body = body;

        // Update the timestamp
        blog.timestamp = Date.now();

        // Save the updated blog
        blog = await blog.save();

        // Return success response
        return res.status(200).json({ message: 'Blog updated successfully', blog });
    } catch (error) {
        // Handle errors
        console.error('Error updating blog:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Retrieve a single blog
exports.getBlog = async (req, res) => {
    try {
        // Extract blog ID from request parameters
        const { id } = req.params;

        // Find the blog by ID
        const blog = await Blog.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Increment read count by 1
        blog.read_count += 1;
        await blog.save();

        // Return the blog with user information
        return res.status(200).json({ blog, author: req.user });
    } catch (error) {
        // Handle errors
        console.error('Error retrieving blog:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Retrieve a list of blogs
exports.getAllBlogs = async (req, res) => {
    try {
        // Query parameters for pagination, filtering, and ordering
        let { page = 1, limit = 20, state, sortBy = 'timestamp', sortOrder = 'desc', search } = req.query;

        // Construct query object based on filters
        const query = {};
        if (state) {
            query.state = state;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search by title
                { description: { $regex: search, $options: 'i' } }, // Case-insensitive search by description
                { tags: { $regex: search, $options: 'i' } } // Case-insensitive search by tags
            ];
        }

        // Construct options object for pagination and sorting
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
        };

        // Retrieve paginated list of blogs
        const blogs = await Blog.paginate(query, options);

        // Return the paginated list of blogs
        return res.status(200).json({ blogs });
    } catch (error) {
        // Handle errors
        console.error('Error retrieving blogs:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Calculate reading time based on content length or complexity
function calculateReadingTime(content) {
    // Simple calculation based on average reading speed (e.g., 200 words per minute)
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}
