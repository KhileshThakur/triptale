const router = require("express").Router();
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// REPLACE THIS WITH YOUR GOOGLE SCRIPT URL
// If you haven't deployed it, just leave it dummy. The code below will fallback to console.log.
const GAS_URL = process.env.EMAILER;

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Send Email via Google Apps Script (With Console Fallback)
const sendEmail = async (email, subject, message, plainTextOtp) => {
  try {
    await axios.post(GAS_URL, { email, subject, message });
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.log("⚠️ Email Service Failed (Check GAS_URL).");
    console.log("========================================");
    console.log(`🔐 FALLBACK OTP FOR ${email}: ${plainTextOtp}`);
    console.log("========================================");
    // We do NOT throw error here, so the frontend still succeeds.
  }
};

// 1. SEND OTP (Registration)
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json("User already exists!");

    const otpCode = generateOTP();
    const newOtp = new Otp({ email, code: otpCode });
    await newOtp.save();

    // Send Email (Pass OTP for console fallback)
    await sendEmail(
      email, 
      "TripTale Verification Code", 
      `<h3>Welcome to TripTale! 🌍</h3><p>Your verification code is: <b>${otpCode}</b></p>`,
      otpCode
    );

    res.status(200).json("OTP sent! (Check email or Server Console)");
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json("Server Error: " + err.message);
  }
});

// 2. REGISTER (Verify & Create)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    const validOtp = await Otp.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json("Invalid or expired OTP!");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    const user = await newUser.save();

    await Otp.deleteMany({ email });
    res.status(200).json(user._id);
  } catch (err) { 
    console.error(err);
    res.status(500).json("Registration failed"); 
  }
});

// 3. LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("Wrong email or password!");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Wrong email or password!");

    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "5d" });
    res.status(200).json({ _id: user._id, username: user.username, token });
  } catch (err) { 
    console.error(err);
    res.status(500).json(err.message); 
  }
});

// 4. FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found!");

    const otpCode = generateOTP();
    await new Otp({ email, code: otpCode }).save();

    await sendEmail(
      email, 
      "Reset Password - TripTale", 
      `<h3>Password Reset Request</h3><p>Your reset code is: <b>${otpCode}</b></p>`,
      otpCode
    );

    res.status(200).json("OTP sent. (Check Console if email fails)");
  } catch (err) { res.status(500).json(err.message); }
});

// 5. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const validOtp = await Otp.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json("Invalid OTP!");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.status(200).json("Password updated!");
  } catch (err) { res.status(500).json(err.message); }
});

// 6. UPDATE PASSWORD
router.post("/update-password", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ username });
    
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).json("Current password incorrect!");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    res.status(200).json("Password updated successfully!");
  } catch (err) { res.status(500).json(err.message); }
});

module.exports = router;