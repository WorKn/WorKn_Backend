const express = require('express');
const { createTag } = require('./../controllers/tagController');
const router = express.Router();

router.post('/', createTag);

module.exports = router;
