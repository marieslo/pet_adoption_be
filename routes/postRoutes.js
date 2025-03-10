const express = require('express');
const router = express.Router();
const PostModel = require('../schemas/PostSchema');
const UserModel = require('../schemas/UserSchema');
const PetModel = require('../schemas/PetSchema'); 
const authMiddleware = require('../middleware/authMiddleware');

// Create a new post (requires authentication)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { content, petId } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    let pet = null;
    if (petId) {
      pet = await PetModel.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
    }
    const newPost = new PostModel({
      user: req.user._id,
      content,
      pet: petId || null, 
    });
    const savedPost = await newPost.save();
    await UserModel.findByIdAndUpdate(req.user._id, {
      $push: { posts: savedPost._id },
    });
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});


// Delete a post (requires authentication and ownership check)
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
    await PostModel.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});


// Edit a post (requires authentication and ownership check)
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content, petId } = req.body;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    if (petId) {
      const pet = await PetModel.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      post.pet = petId;
    }
    post.content = content || post.content;
    const updatedPost = await post.save();
    await UserModel.findByIdAndUpdate(req.user._id, {
      $set: { 'posts.$[elem]': updatedPost }
    }, {
      arrayFilters: [{ 'elem._id': postId }],
      new: true
    });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating post' });
  }
});


// Get posts feed (public, no authentication required)
router.get('/feed', async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate('user', 'firstName avatar')
      .populate('pet', 'name breed', 'picture')
      .select('content tags reactions createdAt user pet') 
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
    const { reaction } = req.body;
    const postId = req.params.postId;

    if (!reaction || !['Like'].includes(reaction)) {
      return res.status(400).json({ message: 'Valid reaction is required (Like)' });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingReaction = post.reactions.find(r => r.userId.toString() === req.user._id.toString());
    if (existingReaction) {
      return res.status(400).json({ message: 'You have already reacted to this post' });
    }

    const newReaction = { userId: req.user._id, reaction };
    post.reactions.push(newReaction);
    await post.save();

    res.status(201).json(newReaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding reaction' });
  }
});


module.exports = router;