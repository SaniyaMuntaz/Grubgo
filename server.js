const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONNECT TO MONGODB (Ensure MongoDB Compass is installed/open)
mongoose.connect('mongodb://127.0.0.1:27017/grubgo_db')
  .then(() => console.log("✅ Connected to MongoDB..."))
  .catch(err => console.error("❌ Could not connect:", err));

// 2. DEFINE THE DATA STRUCTURE
const restaurantSchema = new mongoose.Schema({
  name: String, mood: String, dish: String, rating: String, 
  time: String, price: String, image: String
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// 3. API ROUTE: GET ALL RESTAURANTS
app.get('/api/restaurants', async (req, res) => {
  try {
    const stores = await Restaurant.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. START THE SERVER
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Kitchen (Backend) running on http://localhost:${PORT}`));