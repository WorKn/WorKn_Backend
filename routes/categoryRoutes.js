const express = require('express');
const {
  getAllCategories,
  getCategoriesTag,
  createCategory,
} = require('./../controllers/categoryController');
const router = express.Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.get('/:categoryName/tags', getCategoriesTag);

module.exports = router;
