const router = require('express').Router();
const Place = require('../models/Place');

// 1. POST: Create a new Place (Save a memory)
router.post('/', async (req, res) => {
  const newPlace = new Place(req.body);
  try {
    const savedPlace = await newPlace.save();
    res.status(200).json(savedPlace);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET: Get all Places (Load the map pins)
router.get('/', async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json(places);
  } catch (err) {
    res.status(500).json(err);
  }
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