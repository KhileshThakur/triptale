const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// 1. IMPORT ROUTES 
const placeRoute = require('./routes/places'); 
const userRoute =  require('./routes/user');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// 2. USE ROUTES
app.use('/api/places', placeRoute);
app.use("/api/users", userRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));