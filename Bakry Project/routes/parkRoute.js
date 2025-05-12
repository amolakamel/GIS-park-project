const express = require('express');

const { getALLParks,
        getPark,
        addPark,
        updatePark,
        deletePark,
        getNearbyPark,
        getDistanceToPark
    } = require('../services/parkServices')


const router = express.Router();

router.route('/').get(getALLParks).post(addPark);
router.route('/nearby').get(getNearbyPark);
router.route('/distance').get(getDistanceToPark);
router.route('/:id').put(updatePark).delete(deletePark).get(getPark)

module.exports = router;