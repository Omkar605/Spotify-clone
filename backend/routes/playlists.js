const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('owner', 'username')
      .populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, thumbnail } = req.body;
    
    // Create new playlist with the authenticated user as owner
    const playlist = new Playlist({
      name,
      thumbnail,
      owner: req.user.id, // Get user ID from auth middleware
      songs: [] // Initialize empty songs array
    });

    // Save the playlist to database
    const savedPlaylist = await playlist.save();

    // Populate owner details before sending response
    const populatedPlaylist = await savedPlaylist
      .populate('owner', 'firstName lastName');

    res.json(populatedPlaylist);
  } catch (error) {
    console.error('Playlist creation error:', error);
    res.status(500).json({ message: 'Server error while creating playlist' });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'firstName lastName')
      .populate('songs')
      .populate('collaborators', 'firstName lastName');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist', error: error.message });
  }
});

// Update playlist
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, thumbnail, isPublic } = req.body;
    const userId = req.user.userId;

    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== userId && 
        !playlist.collaborators.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        name: name || playlist.name,
        description: description || playlist.description,
        thumbnail: thumbnail || playlist.thumbnail,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: 'Error updating playlist', error: error.message });
  }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Only owner can delete playlist
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await playlist.remove();
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playlist', error: error.message });
  }
});

// Add song to playlist
router.post('/:id/songs', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.userId;
    const playlistId = req.params.id;

    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== userId && 
        !playlist.collaborators.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Check if song already exists in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to playlist', error: error.message });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user.userId;
    const playlistId = req.params.id;

    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== userId && 
        !playlist.collaborators.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from playlist', error: error.message });
  }
});

// Like/Unlike playlist
router.post('/playlists/:id/like', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlistId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if playlist is already liked
    const isLiked = user.likedPlaylists.includes(playlistId);

    if (isLiked) {
      // Unlike playlist
      user.likedPlaylists = user.likedPlaylists.filter(id => id.toString() !== playlistId);
      await user.save();
      return res.json({ message: 'Playlist removed from liked playlists' });
    } else {
      // Like playlist
      user.likedPlaylists.push(playlistId);
      await user.save();
      return res.json({ message: 'Playlist added to liked playlists' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 