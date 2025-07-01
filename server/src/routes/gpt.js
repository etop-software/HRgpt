const express = require('express');
const router = express.Router();
const hrController = require('../controllers/gptController');

router.post('/ask-hr', hrController.askHR);

module.exports = router;