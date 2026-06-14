const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection URI string simulation
const MONGO_URI = "mongodb+srv://blogadmin:blogpass123@cluster0.mongodb.net/blogplatform?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Blog Platform MongoDB Database Active"))
  .catch(err => console.log("Database Connection Failure:", err));

// Database Schema definition
const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: String,
    date: { type: Date, default: Date.now },
    comments: [{ user: String, text: String }]
});

const Blog = mongoose.model('Blog', BlogSchema);

// RESTFUL APIS ENDPOINTS
app.get('/api/posts', async (req, res) => {
    const posts = await Blog.find().sort({ date: -1 });
    res.json(posts);
});

app.post('/api/posts', async (req, res) => {
    const newPost = new Blog(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

app.put('/api/posts/:id', async (req, res) => {
    const updatedPost = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
});

app.delete('/api/posts/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted successfully" });
});

app.post('/api/posts/:id/comment', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if(blog) {
        blog.comments.push(req.body); // expecting { user, text }
        await blog.save();
        res.status(201).json(blog);
    } else {
        res.status(404).json({ error: "Post missing" });
    }
});

app.listen(5000, () => console.log('Blog Platform Backend Server listening on Port 5000'));
