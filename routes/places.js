const router = require("express").Router();
const Place = require("../models/Place");

// CREATE PIN
router.post("/", async (req, res) => {
  const newPlace = new Place(req.body);
  try {
    const savedPlace = await newPlace.save();
    res.status(200).json(savedPlace);
  } catch (err) { res.status(500).json(err); }
});

// GET PINS (Filter by username if provided in query)
router.get("/", async (req, res) => {
  try {
    const username = req.query.username;
    let places;
    if(username) {
        places = await Place.find({ username: username }); // Only my pins
    } else {
        places = await Place.find(); // All pins (optional)
    }
    res.status(200).json(places);
  } catch (err) { res.status(500).json(err); }
});

// 3. DELETE: Delete a place
router.delete('/:id', async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.status(200).json("Place deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. PUT: Update a place
router.put('/:id', async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Return the updated document
    );
    res.status(200).json(updatedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;