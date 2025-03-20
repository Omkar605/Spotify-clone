const getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).populate('likedSongs');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.likedSongs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLikedPlaylists = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).populate('likedPlaylists');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.likedPlaylists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to your routes
// GET /api/users/liked-songs
router.get('/users/liked-songs', auth, getLikedSongs);

// GET /api/users/liked-playlists
router.get('/users/liked-playlists', auth, getLikedPlaylists);
