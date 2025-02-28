const mongoose = require('mongoose');
const Reaction = require('./ReactionModel');
const Comment = require('./CommentModel'); 

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    reactions: [Reaction.schema], 
    comments: [Comment.schema],  
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = Post;