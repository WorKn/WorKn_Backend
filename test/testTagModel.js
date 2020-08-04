const Model = require('../models/tagModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  name: 'js2',
  category: 'tech',
};

testModel(new_element, Model);
