const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: { type: String },
  tags: [String],
  reactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      reaction: { type: String, required: true, enum: ['Like', 'Love', 'Laugh', 'Celebrate'] },  // Changed from emoji to word-based reaction
    }
  ],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;