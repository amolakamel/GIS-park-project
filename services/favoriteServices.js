const favoriteModel = require('../models/favoriteModel');
const placeModel = require('../models/placeModel');

exports.addToFavorites = async (req, res) => {
  const { userId, placeId } = req.body; 

  try {
    const place = await placeModel.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    const existingFavorite = await Favorite.findOne({ userId, placeId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'This place is already in your favorites' });
    }

    const newFavorite = new Favorite({
      userId,
      placeId,
      name: place.name,
      category: place.category,
      location: place.location,
    });

    await newFavorite.save();

    res.status(201).json({ message: 'Place added to favorites', data: newFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to favorites', error: error.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  const { userId } = req.params;

  try {
    const favorites = await favoriteModel.find({ userId });
    res.status(200).json({ data: favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
};

exports.removeFromFavorites = async (req, res) => {
  const { userId, placeId } = req.params;

  try {
    const favorite = await favoriteModel.findOneAndDelete({ userId, placeId });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Place removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from favorites', error: error.message });
  }
};