const express = require('express');
const {
    getAllCategories,
    getCategoriesTag
} = require('./../controllers/categoryController');
const router = express.Router();

router.get('/',getAllCategories);
router.get('/:categoryName/tags',getCategoriesTag);

module.exports = router;