const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  track: {
    type: String,
    required: true
  },
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema); 