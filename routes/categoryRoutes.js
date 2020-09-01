const express = require('express');
const {
    getAllCategories,
    getTagOnCategory
} = require('./../controllers/categoryController');
const router = express.Router();

router.get('/',getAllCategories);
router.get('/:categoryName/tags',getTagOnCategory);

module.exports = router;