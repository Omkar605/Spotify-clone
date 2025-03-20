require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect("mongodb+srv://omkarzagade605:Ixedovz4321@cluster0.mjneqcl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));

// Update port configuration
const PORT = process.env.PORT || 5000;

// Add this for Render deployment
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 