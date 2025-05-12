const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
},
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Place'
},
  name: {
    type: String,
    required: true
},
  category: {
    type: String,
    required: true
},
  location: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
},
{ timestamps: true });

favoriteSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Favorite', favoriteSchema);