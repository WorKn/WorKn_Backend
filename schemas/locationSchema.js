const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  coordinates: [Number],
  address: String,
  _id: false,
});

module.exports = locationSchema;
