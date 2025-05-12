const express = require('express');

const { getAllPlaces,
        getDistanceToPlace,
        getNearbyPlaces,
        getPlace,
        updatePlace,
        deletePlace,
        createPlace,
        getPlaceById,
        searchGooglePlaces
} = require('../services/placeServices')


const router = express.Router();

router.route('/').get(getAllPlaces).post(createPlace);
router.route('/nearby').get(getNearbyPlaces).post(searchGooglePlaces);
router.route('/distance').get(getDistanceToPlace);
router.route('/:id').put(updatePlace).delete(deletePlace).get(getPlaceById)
router.route('/getPlace').post(getPlace);

module.exports = router;