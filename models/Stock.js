const mongoose = require('mongoose');
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }
});

module.exports = mongoose.model('Stock', stockSchema);