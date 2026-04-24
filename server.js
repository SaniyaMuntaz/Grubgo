import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONNECT TO MONGODB (Ensure MongoDB Compass is installed/open)
// This tells the code: "Use the Cloud link if it exists, otherwise use localhost"
// This tells your code to use the cloud link if provided (by Render), 
// or use the local one if you are running it on your own computer.
const dbURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/grubgo";

mongoose.connect(dbURI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
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
