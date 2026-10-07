const mongoose = require("mongoose");

const GalleryRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// One request relationship between two users
GalleryRequestSchema.index(
  { requester: 1, owner: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "GalleryRequest",
  GalleryRequestSchema
);