const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get MongoDB URI from environment variables
const mongoDB = process.env.MONGODB_URI;

// Connect to MongoDB Atlas
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Optional: handle connection events
const db = mongoose.connection;
db.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});
