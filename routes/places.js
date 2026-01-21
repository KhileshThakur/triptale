const router = require("express").Router();
const Place = require("../models/Place");

// 1. CREATE PIN
router.post("/", async (req, res) => {
  const newPlace = new Place(req.body);
  try {
    const savedPlace = await newPlace.save();
    res.status(200).json(savedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET PINS (THE FIX)
router.get("/", async (req, res) => {
  try {
    const username = req.query.username;
    let places;
    
    if (username) {
      // Logged In: Fetch ONLY this user's pins
      places = await Place.find({ username: username });
    } else {
      // Logged Out: Fetch NOTHING (or change to .find() if you want public pins)
      // We return an empty array to keep the map clean for guests
      places = []; 
    }
    
    res.status(200).json(places);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. UPDATE PIN
router.put("/:id", async (req, res) => {
  try {
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
    await Place.findByIdAndDelete(req.params.id);
    res.status(200).json("Pin deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;