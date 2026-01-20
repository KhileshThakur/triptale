const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['visited', 'bucket-list'],
    default: 'visited'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  visitDate: Date,
  rating: { type: Number, min: 1, max: 5 }, // Added Rating
  
  // UPGRADE: Support multiple images with captions
  images: [
    {
      url: String,
      caption: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Place', PlaceSchema);