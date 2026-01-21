const router = require("express").Router();
const Place = require("../models/Place");

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
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedPlace);
  } catch (err) { res.status(500).json(err); }
});

// 4. DELETE PIN (Uses Place ID, unchanged)
router.delete("/:id", async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.status(200).json("Pin deleted");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;