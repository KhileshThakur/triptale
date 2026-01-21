const router = require("express").Router();
const Place = require("../models/Place");

// 1. CREATE PIN (Now Trims Username automatically)
router.post("/", async (req, res) => {
  // Defensive: Trim username if it exists in body
  if(req.body.username) {
      req.body.username = req.body.username.trim();
  }

  const newPlace = new Place(req.body);
  try {
    const savedPlace = await newPlace.save();
    console.log("✅ PIN SAVED:", savedPlace.title);
    res.status(200).json(savedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET PINS (The "Forgiving" Search)
router.get("/", async (req, res) => {
  try {
    const username = req.query.username;
    let places;
    
    if (username) {
      // CLEAN THE INPUT
      const cleanUser = username.trim();

      // SMART QUERY: 
      // 1. regex: Match the name even if it has different capitalization ('i' flag)
      // 2. \\s*: Allow zero or more spaces at the end
      places = await Place.find({ 
          username: { $regex: new RegExp("^" + cleanUser + "\\s*$", "i") } 
      });

      console.log(`🔍 SEARCH: "${cleanUser}" -> FOUND: ${places.length}`);
    } else {
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