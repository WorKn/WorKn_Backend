const Model = require('../models/messageModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  message: '       asd',
  sender: '5f274fbb5f919462400ea392',
};

testModel(new_element, Model);
