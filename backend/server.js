// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const cors = require('cors');


// Connect to MongoDB (adjust the connection string if needed)
mongoose.connect('mongodb://192.168.2.21:27017/mealMateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


// Define the User schema
const UserSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  cuisine: String,
});

const User = mongoose.model('User', UserSchema);

// Define a schema for meal plans
const MealPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantName: { type: String, required: true },
    planName: { type: String, required: true },
    customization: { type: Object, required: true },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
const MealPlan = mongoose.model('MealPlan', MealPlanSchema);
  

const app = express(); // Initalizing the express
app.use(cors({
    origin: 'http://127.0.0.1:5500',  
    credentials: true,               // Allow session cookies from browser to pass
  }));

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session management
app.use(session({
  secret: 'yourSecretKey', // Not recommened for prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      // false because we’re not using HTTPS in development
    sameSite: 'lax'     // 'lax' often works for development; 'none' requires HTTPS
  }
}));

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { fullname, email, password, cuisine } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, password: hashedPassword, cuisine });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed!' });
  }
});



// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });
      
      req.session.userId = user._id;  // Setting the session variable
      res.json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// (Optional) Protected route to get user data
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Save a meal plan for the logged-in user
// POST /api/plan
app.post('/api/plan', isAuthenticated, async (req, res) => {
    try {
      // Try to find an existing plan for the logged-in user
      const existingPlan = await MealPlan.findOne({ userId: req.session.userId });
      
      if (existingPlan) {
        // Update the existing plan with the new details
        existingPlan.restaurantName = req.body.restaurantName;
        existingPlan.planName = req.body.planName;
        existingPlan.customization = req.body.customization;
        existingPlan.totalPrice = req.body.totalPrice;
        await existingPlan.save();
        return res.json({ message: 'Your meal plan is booked successfully! (Previous plan updated)' });
      }
      
      // If no existing plan, create a new one
      const newPlan = new MealPlan({
        userId: req.session.userId,
        restaurantName: req.body.restaurantName,
        planName: req.body.planName,
        customization: req.body.customization,
        totalPrice: req.body.totalPrice
      });
      await newPlan.save();
      res.status(201).json({ message: 'Your meal plan is booked successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to book a meal plan.' });
    }
  });
  

// Get the most recent meal plan for the logged-in user
app.get('/api/plan', isAuthenticated, async (req, res) => {
    try {
      const plan = await MealPlan.findOne({ userId: req.session.userId }).sort({ createdAt: -1 });
      if (!plan) return res.status(404).json({ error: 'No meal plan found.' });
      res.json({ plan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch meal plan.' });
    }
  });
  


// Start the server on port 3000
app.listen(3000, () => console.log('Server running on port 3000'));



