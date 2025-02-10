const express = require('express');
const router = express.Router();
const PostModel = require('../models/PostModel.js');
const UserModel = require('../models/UserModel.js');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new post (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const newPost = new PostModel({
      user: req.user._id,
      content,
      image,
    });
    const savedPost = await newPost.save();
    await UserModel.findByIdAndUpdate(req.user._id, {
      $push: { posts: savedPost._id } 
    });

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Edit a post (requires authentication and ownership check)
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content, image } = req.body;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    post.content = content || post.content;
    post.image = image || post.image;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete a post (requires authentication)
router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.postId;
  
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own posts' });
      }
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { posts: postId }
      });
      await post.deleteOne(); 
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting post' });
    }
  });
  
// Get posts feed (public, no authentication required)
router.get('/feed', async (req, res) => {
    try {
      const posts = await PostModel.find()
        .populate('user', 'firstName lastName')
        .select('content image tags reactions createdAt user') 
        .sort({ createdAt: -1 }); 
  
      res.json(posts);  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching posts' });
    }
  });
  
// Add a comment to a post (POST request)
router.post('/:postId/comment', authMiddleware, async (req, res) => {
    try {
      const { content } = req.body;
      const postId = req.params.postId;
  
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
  
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const newComment = {
        userId: req.user._id,
        content,
      };
  
      post.comments.push(newComment);
      await post.save();
  
      res.status(201).json(newComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  });

  // Add a reaction to a post (POST request)
router.post('/:postId/reaction', authMiddleware, async (req, res) => {
    try {
      const { emoji } = req.body;
      const postId = req.params.postId;
  
      if (!emoji) {
        return res.status(400).json({ message: 'Emoji is required' });
      }
  
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const newReaction = {
        userId: req.user._id,
        emoji,
      };
  
      post.reactions.push(newReaction);
      await post.save();
  
      res.status(201).json(newReaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding reaction' });
    }
  });

  
module.exports = router;