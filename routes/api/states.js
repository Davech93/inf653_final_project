const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');

router.route('/states')
    .get(statesController.getAllStates)
    .post(statesController.createNewState)
    .put(statesController.updateState)
    .delete(statesController.deleteState);

router.route('/states')
    .get(statesController.contigStates);

router.route('/:code/capital')
    .get(statesController.getCapital);

router.route('/:code/nickname')
    .get(statesController.getNickname);

router.route('/:code/population')
    .get(statesController.getPopulation);

router.route('/:code/admission')
    .get(statesController.getAdmission);


module.exports = router;