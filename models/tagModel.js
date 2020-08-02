const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    require: true,
    lowercase: true,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
