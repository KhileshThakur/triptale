const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema(
  {
    // 👇 LINK TO USER ID (Foreign Key)
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    title: { type: String, required: true, min: 3 },
    description: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },

    status: { type: String, enum: ['visited', 'bucket-list'], default: 'visited' },
    visitDate: { type: Date },
    images: [{ url: String, caption: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", PlaceSchema);