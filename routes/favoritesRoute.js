const express = require('express');
const { addToFavorites,
        getUserFavorites,
        removeFromFavorites
    } = require('../services/favoriteServices');
const router = express.Router();

router.post('/favorites', addToFavorites);

router.get('/favorites/:userId', getUserFavorites);

router.delete('/favorites/:userId/:placeId', removeFromFavorites);

module.exports = router;