const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all songs
router.get('/', auth, async (req, res) => {
  try {
    const songs = await Song.find()
      .populate('artist', 'firstName lastName'); // Only populate specific fields from artist

    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add song
router.post('/', auth, async (req, res) => {
  try {
    const { name, thumbnail, track } = req.body;
    const song = new Song({
      name,
      thumbnail,
      track,
      artist: req.user.userId // Get artist ID from authenticated user
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Error creating song', error: error.message });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('addedBy', 'username');
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update song
router.put('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if user is the owner
    if (song.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(song, req.body);
    await song.save();
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete song
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if user is the owner
    if (song.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await song.remove();
    res.json({ message: 'Song removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like song
const likeSong = async (req, res) => {
  try {
    const userId = req.user.userId;
    const songId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if song is already liked
    const isLiked = user.likedSongs.includes(songId);

    if (isLiked) {
      // Unlike song
      user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId);
      await user.save();
      return res.json({ message: 'Song removed from liked songs' });
    } else {
      // Like song
      user.likedSongs.push(songId);
      await user.save();
      return res.json({ message: 'Song added to liked songs' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to your routes
// POST /api/songs/:id/like
router.post('/songs/:id/like', auth, likeSong);

module.exports = router; 