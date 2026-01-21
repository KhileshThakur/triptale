const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      min: 3, 
      max: 20 
      // unique: true <--- REMOVED: Multiple people can have the same name now
    },
    email: { 
      type: String, 
      required: true, 
      max: 50, 
      unique: true // Email MUST be unique for login
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