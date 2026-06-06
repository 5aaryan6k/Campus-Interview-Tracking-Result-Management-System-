const express = require('express');
const router = express.Router();
const {
  getRoundCandidates,
  registerCandidates,
  recordAttendance,
  recordResults,
} = require('../controllers/roundController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all endpoints

router.route('/:roundId/candidates')
  .get(getRoundCandidates);

router.route('/:roundId/candidates/register')
  .post(registerCandidates);

router.route('/:roundId/attendance')
  .post(recordAttendance);

router.route('/:roundId/results')
  .post(recordResults);

module.exports = router;
