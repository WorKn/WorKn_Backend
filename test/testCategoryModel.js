const Model = require('../models/categoryModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  name: 'HEalTh',
};

testModel(new_element, Model);
