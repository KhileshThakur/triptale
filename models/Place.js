const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema(
  {
    // 1. CRITICAL FIX: Add username so it saves to the DB
    username: { 
      type: String, 
      required: true 
    },

    title: { 
      type: String, 
      required: true, 
      min: 3 
    },

    description: { 
      type: String, 
      required: true 
    },

    rating: { 
      type: Number, 
      min: 0, 
      max: 5,
      default: 5 
    },

    // 2. MATCH FRONTEND STRUCTURE: location: { lat, lng, address }
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },

    status: { 
      type: String, 
      enum: ['visited', 'bucket-list'], 
      default: 'visited' 
    },

    visitDate: { 
      type: Date 
    },

    // 3. MATCH FRONTEND IMAGES: Array of objects
    images: [
        {
            url: { type: String },
            caption: { type: String }
        }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", PlaceSchema);