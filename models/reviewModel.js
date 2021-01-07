const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, 'La puntuación mínima es 1.0'],
      max: [5, 'La puntuación máxima es 5.0'],
      required: [true, 'El review debe poseer al menos un rating.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'El review debe pertenecer a algún usuario.'],
    },
    userReviewed: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'El review debe de estar dirigido a algún usuario.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Query Middlewares

//This function populates the 'createdBy' field everytime any 'find' operation gets executed.
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: '_id name lastname profilePicture organization',
    populate: [{ path: 'organization', select: '_id name email profilePicture' }],
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
