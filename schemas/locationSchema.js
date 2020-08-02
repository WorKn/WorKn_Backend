const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  coordinates: [Number],
  address: String,
});

module.exports = locationSchema;
