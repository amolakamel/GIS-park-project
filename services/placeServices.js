const placeModel = require('../models/placeModel');
const axios = require('axios');
const { Client } = require('@googlemaps/google-maps-services-js');
const googleMapClient = new Client({});
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');

exports.createPlace = asyncHandler(async (req, res, next) => {
  const { name, category, location} = req.body;
  const place = await placeModel.create(req.body);
  res.status(201).json({ data:place });
});

exports.getAllPlaces = asyncHandler(async (req, res) => {
  const place = await placeModel.find({});
  res.status(200).json({ results: place.length, data:place});
});

exports.getPlaceById = asyncHandler(async (req, res, next) => {
  const place = await placeModel.findById(req.params.id);
  if (!place){
    return next(new apiError(`NO Place for this id ${id}`),404)
  }
  res.status(200).json({ data:place });
});

exports.updatePlace = asyncHandler(async (req, res, next) => {
  const { name, category, longitude, latitude } = req.body;
  const id = req.params.id;
  const place = await placeModel.findByIdAndUpdate(
    {_id:id},
    {
      name:req.body.name,
      category:req.body.category,
      location:req.body.location
    },
    { new: true }
  );
  if(!place){
    return next(new apiError(`NO Place for this id ${id}`,404));
  }
  res.status(203).json({ data:place });
});

exports.deletePlace = asyncHandler(async (req, res) => {
  await placeModel.findByIdAndDelete(req.params.id);
  res.status(201).json({ message: 'Place deleted successfully' });
});

exports.getNearbyPlaces = asyncHandler(async (req, res) => {
  const { category, longitude, latitude, maxDistance } = req.query;
  const place = await placeModel.find({
    category,
    location: {
      $near: {
        $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseFloat(maxDistance) // km to meters
      }
    }
  }).limit(5);
  res.status(201).json({ data:place })
});

exports.searchGooglePlaces = asyncHandler(async (req, res, next) => {
  try {

    const { lat, lng, category, radius } = req.query;

    if (!lat || !lng || !category) {
      return res.status(400).json({ message: 'Missing required parameters: lat, lng, or category' });
    }

    const encodedCategory = encodeURIComponent(category.trim());
    const location = `${lat},${lng}`;
    const radiusValue = radius || 5000; 

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radiusValue}&type=${encodedCategory}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error.message);
    res.status(500).json({ message: 'Failed to fetch places', error: error.message });
  }
});

exports.getPlace = asyncHandler(async (req, res) => {
    try {
      const response = await googleMapClient.geocode({
        params: {
          address: req.body.address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        }
      });
  
      res.json(response.data.results);
    } catch (err) {
      console.error('Google Geocoding Error:', err.message);
      res.status(500).json({ message: 'Failed to fetch geocoding data', error: err.message });
    }
  });

exports.getDistanceToPlace = async (req, res, next) => {
    const { lat, lng, id } = req.query;
  
    if (!lat || !lng || !id) {
      return next(new ApiError('lat, lng, and Place id are required'),400);
    }
  
    try {
      const place = await placeModel.findById(id);
      if (!place) {
        return res.status(404).json(`NO Place Founded`);
      }
  
      const [placeLng, placeLat] = place.location.coordinates;
  
      const toRad = angle => (angle * Math.PI) / 180;
      const R = 6371e3; // meters
      const φ1 = toRad(lat);
      const φ2 = toRad(placeLat);
      const Δφ = toRad(placeLat - lat);
      const Δλ = toRad(placeLng - lng);
  
      const a = Math.sin(Δφ / 2) ** 2 +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
      const distance = R * c;
  
      res.status(200).json({ status: 'success', distanceInMeters: Math.round(distance) });
    } catch (err) {
      res.status(500).json({ status: 'fail', message: err.message });
    }
  };


