const Category = require('./../models/categoryModel');
const factory = require('./handlerFactory');
const Tag = require('../models/tagModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.getAllCategories = factory.getAll(Category);

exports.getCategoriesTag = catchAsync(async(req,res,next)=>{
    var categoryID = (await Category.findOne({name: req.params.categoryName}))
    var tags = await Tag.find( {category: categoryID} );
    res.status(200).json({
        status: 'success',
        data: {
            tags: tags,
        },  
    });
}); 
   
