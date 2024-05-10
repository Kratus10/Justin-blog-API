// models/blog.js

// Import necessary modules
const mongoose = require('mongoose');
const shortid = require('shortid');

// Define the schema for the Blog model
const blogSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate // Generate unique ID using shortid
    },
    title: { type: String, required: true }, // Title of the blog
    description: { type: String, required: true }, // Description of the blog
    tag: { type: String, required: true }, // Tag of the blog
    author: { type: String, required: true }, // Author of the blog
    createdAt: { type: Date, required: true, default: Date.now }, // Creation timestamp
    updatedAt: { type: Date, default: Date.now }, // Update timestamp
    publishedAt: { type: Date }, // Publish timestamp
    state: { type: String, default: 'draft' }, // State of the blog (draft or published)
    user_id: { type: mongoose.Schema.Types.String, ref: 'User' }, // Reference to the user who created the blog
    read_count: { type: Number, required: true, default: 0 }, // Read count of the blog
    reading_time: { type: Number }, // Reading time of the blog
    body: { type: String, required: true } // Body/content of the blog
});

// Middleware to update the updatedAt timestamp before saving
blogSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Define the Blog model using the schema
const blogModel = mongoose.model('Blog', blogSchema);

// Export the Blog model
module.exports = blogModel;
