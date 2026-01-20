const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// 1. IMPORT ROUTES 
const placeRoute = require('./routes/places'); 

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// 2. USE ROUTES
// Any request to /api/places will go to our places.js file
app.use('/api/places', placeRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));