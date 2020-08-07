const Model = require('../models/tagModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  name: 'js2',
  category: '5f2375264620f36c4ba15a7c',
};

testModel(new_element, Model);
