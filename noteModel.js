const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user' // Make sure you have a User model
  }
});

module.exports = mongoose.model('Note', noteSchema);