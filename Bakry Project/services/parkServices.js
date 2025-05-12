const asyncHandler = require('express-async-handler');
const parkModel = require('../models/parkModel');
const ApiError = require("../utils/apiError");
//const toRad = require('../utils/toRad');


exports.getALLParks = asyncHandler(async (req, res, next) => {  
  const parks = await parkModel.find({ available:true});
    res.status(200).json({ results:parks.length, data: parks });
});

exports.addPark = asyncHandler(async (req, res, next) => {
    const park = await parkModel.create(req.body);
    res.status(201).json({ data: park })
});

exports.getPark = asyncHandler(async(req, res, next) => {
    const {id} = req.params.id;
    const park = await parkModel.findById({id});
    if (!park){
      return next( new ApiError(`No park for this id ${id}`),404);
    }
    res.status(200).json({ status: 'success', data: park });
});

exports.updatePark = asyncHandler(async (req, res, next) => {
  const id = req.params;

  const park = await parkModel.findOneAndUpdate(
      { _id: id },
      {
          location: req.body.location,
          available: req.body.available,
          type: req.body.type
      },
      {
          new: true
      }
  );

  if (!park) {
      return next(new ApiError(`No park found for this id: ${id}`, 404));
  }

  res.status(200).json({ data: park });
});

exports.deletePark = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const park = await parkModel.findOneAndDelete({ _id: id });

  if (!park) {
      next(new ApiError(`No park found for this id: ${id}`, 404));
  }

  res.status(201).json({ message: 'Deleted successfully' });
});

exports.getNearbyPark = asyncHandler(async (req, res, next) => {
  const { lat, lng, type, available, maxDistance  } = req.query;

  if (!lat || !lng ) {
    return next(new ApiError('lat, lng, and type are required', 400));
  }

  const filters = {};

  if (type) filters.type = type;

  if (available !== undefined) filters.available = available === 'true';

  const parks = await parkModel.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(maxDistance, 10) || 5000
      }
    },
    ...filters
  }).limit(5);

  if (parks.length === 0) {
    return next(new ApiError('No nearby parks found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: parks.length,
    data: parks
  });
});

exports.getDistanceToPark = async (req, res, next) => {
    const { lat, lng, id } = req.query;
  
    if (!lat || !lng || !id) {
      return next(new ApiError('lat, lng, and parking park id are required'),400);
    }
  
    try {
      const park = await parkModel.findById(id);
      if (!park) {
        return res.status(404).json(`NO Park Founded`);
      }
  
      const [parkLng, parkLat] = park.location.coordinates;
  
      const toRad = angle => (angle * Math.PI) / 180;
      const R = 6371e3; // meters
      const φ1 = toRad(lat);
      const φ2 = toRad(parkLat);
      const Δφ = toRad(parkLat - lat);
      const Δλ = toRad(parkLng - lng);
  
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