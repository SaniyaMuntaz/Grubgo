import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
const dbURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/grubgo";

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 2. RESTAURANT SCHEMA (The only one you need now)
const restaurantSchema = new mongoose.Schema({
  name: String, 
  mood: String, 
  dish: String, 
  rating: String, 
  time: String, 
  price: String, 
  image: String,
  lat: String,
  lng: String
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// 3. API ROUTES
app.get('/', (req, res) => {
  res.send("🚀 GrubGo Backend is Running without Login!");
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const stores = await Restaurant.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. START SERVER
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
