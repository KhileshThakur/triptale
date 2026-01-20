const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // <--- NEW FIELD
    title: { type: String, required: true, min: 3 },
    description: { type: String, required: true, min: 3 },
    rating: { type: Number, min: 0, max: 5 },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['visited', 'bucket-list'], default: 'visited' },
    visitDate: { type: Date },
    images: [{
        url: String,
        caption: String
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", PlaceSchema);