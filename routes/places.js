const router = require("express").Router();
const Place = require("../models/Place");
const { deleteImage } = require("../utils/cloudinary");

// 1. CREATE PIN
router.post("/", async (req, res) => {
  const newPlace = new Place(req.body);
  try {
    const savedPlace = await newPlace.save();
    console.log("✅ PIN SAVED for User ID:", savedPlace.userId);
    res.status(200).json(savedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET PINS
router.get("/", async (req, res) => {
  try {
    // 👇 Search by ID
    const userId = req.query.userId;
    let places;
    
    if (userId) {
      places = await Place.find({ userId: userId });
    } else {
      places = []; 
    }
    res.status(200).json(places);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. UPDATE PIN (Uses Place ID, unchanged)
router.put("/:id", async (req, res) => {
  try {
    // 1. Find the original trip first
    const originalPlace = await Place.findById(req.params.id);
    if (!originalPlace) return res.status(404).json("Trip not found");

    // 2. Identify Deleted Images
    // The Frontend sends 'req.body.images' (the list we WANT to keep)
    const newImages = req.body.images || [];
    
    // Create a set of URLs currently in the update payload for fast lookup
    const newImageUrls = new Set(newImages.map(img => img.url));

    // Filter: If an old image URL is NOT in the new list, it must go!
    const imagesToDelete = originalPlace.images.filter(
        oldImg => !newImageUrls.has(oldImg.url)
    );

    // 3. Delete from Cloudinary
    if (imagesToDelete.length > 0) {
        console.log(`🗑️ Cleaning up ${imagesToDelete.length} removed images...`);
        
        // We use a try/catch here so the DB update still happens even if Cloudinary fails
        try {
            const deletePromises = imagesToDelete.map(img => deleteImage(img.url));
            await Promise.all(deletePromises);
        } catch (imgErr) {
            console.error("⚠️ Cloudinary Cleanup Failed:", imgErr.message);
        }
    }

    // 4. Update the Database
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json(updatedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. DELETE PIN
router.delete("/:id", async (req, res) => {
  try {
    // 1. Find the trip
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json("Trip not found");

    // 2. Try to delete images (But don't crash if it fails)
    try {
        if (place.images && place.images.length > 0) {
            const deletePromises = place.images.map(img => deleteImage(img.url));
            await Promise.all(deletePromises);
        }
    } catch (imgErr) {
        console.error("⚠️ Cloudinary Delete Failed (Check .env keys):", imgErr.message);
    }

    // 3. Delete from Database (This MUST happen)
    await Place.findByIdAndDelete(req.params.id);
    
    res.status(200).json("Pin deleted successfully");
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json(err);
  }
});

module.exports = router;