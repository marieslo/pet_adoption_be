const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reaction: { 
    type: String, 
    required: true, 
    enum: ['Like']  // Add more reactions if needed
  },
  createdAt: { type: Date, default: Date.now },
});

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;