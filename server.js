const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const placeRoute = require('./routes/places');
const userRoute = require('./routes/user');
const galleryRoute = require('./routes/gallery');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: "*",
    credentials: true
}));

// API routes
app.use('/api/places', placeRoute);
app.use('/api/users', userRoute);
app.use('/api/gallery', galleryRoute);

// Serve React frontend
app.use(express.static(
    path.join(__dirname, "client", "dist")
));

// React Router fallback
app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, "client", "dist", "index.html")
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});