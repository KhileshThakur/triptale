const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      min: 3, 
      max: 20,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50
    },
    email: { 
      type: String, 
      required: true, 
      max: 50, 
      unique: true,
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: true, 
      min: 6 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);