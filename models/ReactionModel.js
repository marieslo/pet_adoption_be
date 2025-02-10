const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true, enum: ['❤️', '👍', '😂', '🎉'] }, 
  createdAt: { type: Date, default: Date.now },
});

const Reaction = mongoose.model('Reaction', reactionSchema);
module.exports = Reaction;
