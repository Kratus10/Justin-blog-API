const express = require('express');
const userRouter = require('./controllers/router.js');
const blogRouter = require('./routes/blogRouter.js');
const {connectionToMongodb} = require('./db/connect.js');
const logger = require('./config/logger.js');
const auth = require('./auth.js');
const path = require('path');
const winston = require('winston');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
{connectionToMongodb};

// Routes
app.use('/users', userRouter);
app.use('/blogs', blogRouter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Render home page
app.get("/", (req, res) => {
    res.render("home");
});

// Render page with published blogs
app.get("/publishedblogs", async (req, res) => {
    try {
        const publishedBlogs = await blog.find({ state: "published" });
        res.render("publishedBlogs", { blogs: publishedBlogs });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Render page with a single blog
app.get("/blog/:_id", async (req, res) => {
    try {
        const blogId = req.params._id;
        const blog = await blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.read_count += 1;
        await blog.save();

        const user_id = blog.user_id;
        const user = await user.findById(user_id); // Changed userModel to user

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.render("blog", { user_id: user_id, user: user, blog: blog, date: new Date() });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Render page with all blogs
app.get("/allblogs", async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const searchAuthor = req.query.author;
        const searchTitle = req.query.title;
        const searchTags = req.query.tags;
        const orderField = req.query.orderField; 
        const orderDirection = req.query.orderDirection;

        const totalBlogs = await blog.countDocuments();
        const users = await user.find({ user_id }); // Changed userModel to user

        let page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const totalPages = Math.ceil(totalBlogs / limit);

        if (page < 1) {
            page = 1;
        } else if (page > totalPages) {
            page = totalPages;
        }

        const skip = (page - 1) * limit;

        const query = {};

        if (searchAuthor) {
            query.author = searchAuthor;
        }
        if (searchTitle) {
            query.title = searchTitle;
        }
        if (searchTags) {
            query.tags = { $in: searchTags.split(",") };
        }

        const sort = {};

        if (orderField && (orderDirection === "asc" || orderDirection === "desc")) {
            sort[orderField] = orderDirection;
        }

        const blogs = await blog.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sort);

        for (let i = 0; i < blogs.length; i++) {
            const blog = blogs[i];
            blog.read_count += 1;

            if (blog.body) {
                const words = blog.body.split(' ');
                const reading_time = Math.ceil(words.length / 200);
                blog.reading_time = reading_time;
            }

            await blog.save();
        }

        res.status(200).render("allblogs", {
            user_id: user_id,
            users: users,
            page: page,
            totalPages: totalPages,
            totalBlogs: totalBlogs,
            limit: limit,
            blogs: blogs,
            date: new Date(),
        });
    } catch (err) {
        return res.json(err);
    }
});

// Render dashboard
app.get("/dashboard", auth.authenticateUser, async (req, res) => {
    try {
        const user_id = req.user_id;
        const user = req.user;
        const blogs = await blog.find({ user_id: user_id });

        res.status(200).render("dashboard", { user_id, user,  blogs, date: new Date() });
    } catch (err) {
        return res.json(err);
    }
});

// Render page to update a blog
app.get("/update/:_id", async (req, res) => {
    try {
        const postId = req.params._id;
        const blog = await blog.findById(postId);

        if (!blog) {
            return res.status(404).json({ message: "Blog post not found" });
        }

        res.render("updateblog", { blog });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Render page to create a blog
app.get("/create", (req, res) => {
    res.render("createblog");
});

// Render signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Render login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Render page for existing user
app.get("/existinguser", (req, res) => {
    res.render("existinguser");
});

// Render page for invalid info
app.get("/invalidinfo", (req, res) => {
    res.render("invalidinfo");
});

// Render unknown page
app.get("/unknown", (req, res) => {
    res.render("unknown");
});

// Logout user
app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/login");
});

// Middleware for logging requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info(`justin's Server is running on port ${PORT}`);
});

module.exports = app;
