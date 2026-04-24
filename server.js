import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs'; // New
import jwt from 'jsonwebtoken';
const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET
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
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);
// 3. API ROUTE: GET ALL RESTAURANTS
app.get('/', (req, res) => {
  res.send("🚀 GrubGo Backend is Running!");
});
app.get('/api/restaurants', async (req, res) => {
  const stores = await Restaurant.find();
  res.json(stores);
});

// 2. Register User (New)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// 3. Login User (New)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Sign the token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});

// 4. START THE SERVER
// 4. START THE SERVER
// Render provides a PORT automatically, so we use process.env.PORT
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
