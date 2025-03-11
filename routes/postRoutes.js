const express = require('express');
const router = express.Router();
const PostModel = require('../schemas/PostSchema');
const UserModel = require('../schemas/UserSchema');
const PetModel = require('../schemas/PetSchema');
const authMiddleware = require('../middleware/authMiddleware');

// create a new post
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { content, petId } = req.body;
    if (!content || content.trim() === '') {
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

// delete a post
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
    await PostModel.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// edit a post
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }
    post.content = content;
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error editing post:', error);
    res.status(500).json({ message: 'Error editing post' });
  }
});


// add a comment to a post
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty.' });
    }
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = {
      user: req.user._id, 
      firstName: req.user.firstName,
      content,
    };
    post.comments.push(newComment);
    await post.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});


// delete a comment from a post
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const commentIndex = post.comments.findIndex((comment) => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (post.comments[commentIndex].user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    post.comments.splice(commentIndex, 1);
    await post.save()
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});


// react to a post 
router.post('/:postId/reactions', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const existingReaction = post.reactions.find((reaction) => reaction.user.toString() === req.user._id.toString());
    if (existingReaction) {
      if (existingReaction.type === type) {
        // If the user clicks the same reaction, remove it (unreact)
        post.reactions = post.reactions.filter((reaction) => reaction.user.toString() !== req.user._id.toString());
      } else {
        existingReaction.type = type;
      }
    } else {
      // If the user hasn't reacted yet, add the reaction
      post.reactions.push({ user: req.user._id, type });
    }
    await post.save();
    res.status(200).json(post.reactions);
  } catch (error) {
    console.error('Error reacting to post:', error);
    res.status(500).json({ message: 'Error reacting to post' });
  }
});

// get posts feed (public, no authentication required)
router.get('/feed', async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate('user', 'firstName avatar')
      .populate('pet', 'name type picture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

module.exports = router;