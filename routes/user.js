const router = require("express").Router();
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

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

// --- 1. REGISTRATION & GUIDE EMAIL TEMPLATE ---
const getVerificationEmail = (name, otpCode) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TripTale</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #eef2f5;">
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          
          <div style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); text-align: left;">
            
            <div style="background: linear-gradient(135deg, #ff4d5c 0%, #9c2f38 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">TripTale.</h1>
              <p style="color: #a8c0ff; margin: 10px 0 0; font-size: 16px; font-weight: 500;">Map Your World, One Story at a Time</p>
            </div>

            <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h2 style="color: #333; margin-top: 0; font-size: 24px;">Verify Your Email</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Hi <b>${name}</b>,<br>
                Welcome to the club! You are moments away from creating your digital travel legacy. Use this code to unlock your account:
              </p>

              <div style="margin: 30px 0;">
                <span style="display: inline-block; background-color: #f0f7ff; border: 2px dashed #4a90e2; color: #1e3c72; font-size: 36px; font-weight: 800; padding: 15px 50px; border-radius: 12px; letter-spacing: 8px;">
                  ${otpCode}
                </span>
              </div>
              <p style="font-size: 13px; color: #999;">Code expires in 5 minutes.</p>
            </div>

            <div style="padding: 30px; background-color: #fafbfc;">
              
              <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px; display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="background: #e1f5fe; color: #039be5; padding: 5px 10px; border-radius: 6px; margin-right: 10px; font-size: 14px;">OUR MISSION</span>
                </h3>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                  We built TripTale because photos buried in your camera roll aren't enough. We wanted a <b>Living Canvas</b>—a way to visualize your journey across the globe, pin by pin.
                </p>
              </div>

              <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">🚀 How to Start Mapping</h3>
                <div style="background: white; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                  <div style="margin-bottom: 12px;">👆 <b>Double Click</b> anywhere on the map to add a pin.</div>
                  <div style="margin-bottom: 12px;">📸 <b>Upload Photos</b> to create a visual gallery for that spot.</div>
                  <div style="margin-bottom: 0;">📝 <b>Write your Story</b> to keep the memory alive forever.</div>
                </div>
              </div>

              <div>
                <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">🗺️ Map Legend: Know Your Pins</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="50%" style="padding-bottom: 15px;">
                      <div style="display: flex; align-items: center;">
                        <span style="font-size: 24px; margin-right: 10px;">🟢</span>
                        <div>
                          <strong style="color: #27ae60; display: block; font-size: 14px;">Visited</strong>
                          <span style="font-size: 12px; color: #777;">Places you've been</span>
                        </div>
                      </div>
                    </td>
                    <td width="50%" style="padding-bottom: 15px;">
                      <div style="display: flex; align-items: center;">
                        <span style="font-size: 24px; margin-right: 10px;">🟡</span>
                        <div>
                          <strong style="color: #f1c40f; display: block; font-size: 14px;">Bucket List</strong>
                          <span style="font-size: 12px; color: #777;">Dream destinations</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%">
                      <div style="display: flex; align-items: center;">
                        <span style="font-size: 24px; margin-right: 10px;">🔴</span>
                        <div>
                          <strong style="color: #e74c3c; display: block; font-size: 14px;">Search</strong>
                          <span style="font-size: 12px; color: #777;">Temporary results</span>
                        </div>
                      </div>
                    </td>
                    <td width="50%">
                      <div style="display: flex; align-items: center;">
                        <span style="font-size: 24px; margin-right: 10px;">🔵</span>
                        <div>
                          <strong style="color: #2980b9; display: block; font-size: 14px;">You</strong>
                          <span style="font-size: 12px; color: #777;">Current Location</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </div>

            <div style="background: linear-gradient(135deg, #ff4d5c 0%, #9c2f38 100%); padding: 25px; text-align: center; color: #7f8c8d; font-size: 12px;">
              <p style="margin: 0; color: #bdc3c7;">&copy; ${new Date().getFullYear()} TripTale Inc.</p>
              <p style="margin: 5px 0 0;">Keep Exploring.</p>
            </div>

          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// --- 2. PASSWORD RESET TEMPLATE (Clean & Security Focused) ---
const getResetPasswordEmail = (name, otpCode) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 40px 0;">
          
          <div style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center;">
            
            <div style="background-color: #c0392b; padding: 30px; background-image: linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%);">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">TripTale Security</h1>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Hi <b>${name}</b>,<br>
                We received a request to access your TripTale account. If this was you, use the code below to reset your password.
              </p>

              <div style="background-color: #fff5f5; border: 2px dashed #e74c3c; display: inline-block; padding: 15px 40px; border-radius: 8px; margin-bottom: 30px;">
                <span style="color: #c0392b; font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otpCode}</span>
              </div>

              <p style="font-size: 13px; color: #999; margin: 0;">
                If you didn't ask for this, you can safely ignore this email.<br>
                Your account is safe.
              </p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #aaa; border-top: 1px solid #eee;">
              &copy; ${new Date().getFullYear()} TripTale Inc.
            </div>

          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// 1. SEND OTP (Registration)
router.post("/send-otp", async (req, res) => {
    try {
        const { email, username } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json("User already exists!");

        const otpCode = generateOTP();
        const newOtp = new Otp({ email, code: otpCode });
        await newOtp.save();

        // Send Email (Pass OTP for console fallback)
        await sendEmail(
            email,
            "Start Your Journey! 🌍 Verification Code",
            getVerificationEmail(username || "Traveler", otpCode),
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
        res.status(200).json({ _id: user._id, username: user.username, email: user.email, token });
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
            getResetPasswordEmail(user.username, otpCode),
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
        // 👇 Expect userId
        const { userId, oldPassword, newPassword } = req.body;
        
        // Find by ID
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) return res.status(400).json("Current password incorrect!");

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json("Password updated successfully!");
    } catch (err) { res.status(500).json(err.message); }
});

// 7. UPDATE USERNAME
router.put("/update-username", async (req, res) => {
  try {
    const { userId, newUsername } = req.body;
    
    // Check if username is taken (optional but good practice)
    // Note: If you allow duplicates, you can skip this check.
    
    const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $set: { username: newUsername } },
        { new: true }
    );
    
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 8. DELETE ACCOUNT (The "Nuclear" Option)
router.delete("/delete-account/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json("User not found");

    // A. Find all trips by this user
    const userPlaces = await Place.find({ userId: userId });

    // B. Collect ALL image URLs from ALL trips
    let allImages = [];
    userPlaces.forEach(place => {
        if(place.images) place.images.forEach(img => allImages.push(img.url));
    });

    // C. Delete all images from Cloudinary
    console.log(`🗑️ Deleting ${allImages.length} images for user ${user.username}...`);
    const imagePromises = allImages.map(url => deleteImage(url));
    await Promise.all(imagePromises);

    // D. Delete all trips from DB
    await Place.deleteMany({ userId: userId });

    // E. Delete the User
    await User.findByIdAndDelete(userId);

    res.status(200).json("Account and all data deleted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;