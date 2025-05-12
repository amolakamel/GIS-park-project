const mongoose = require('mongoose');

const parkSchema = new mongoose.Schema({
  name:{
    type:String,
    trim:true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  available: {
    type: Boolean,
    default: true,
    required: true
  },
  type: {
    type: String,
    enum: ['indoor', 'street', 'valet'],
    required: true
  }
});

parkSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parking', parkSchema);