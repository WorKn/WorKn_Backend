const Model = require('../models/userModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  name: 'Ricardo Arias',
  email: 'yonose@gmail.com',
  identificationNumber: '12345678910',
  password: '123456878',
  passwordConfirm: '123456878',
  // userType: 'offerer',
  userType: 'applicant',
  birthday: '2001-12-12',
  category: '5f2375264620f36c4ba15a7c',
  location: {
    coordinates: [13.25, 25.002],
    address: 'calle 4',
  },
  tags: [
    {
      name: 'tag1',
      category: { name: 'category1' },
    },
    {
      name: 'tag2',
      category: { name: 'category2' },
    },
  ],
};

new_element = {
  name: 'Ricardo Arias ofertante',
  email: 'yonosenada@gmail.com',
  identificationNumber: '12345675210',
  password: '123456878',
  passwordConfirm: '123456878',
  userType: 'offerer',
  //userType: 'applicant',
  birthday: '2001-12-12',
  category: '5f2375264620f36c4ba15a7c',
  location: {
    coordinates: [13.25, 25.002],
    address: 'calle 4',
  },
  tags: [
    {
      name: 'tag1',
      category: { name: 'category1' },
    },
    {
      name: 'tag2',
      category: { name: 'category2' },
    },
  ],
};
testModel(new_element, Model);
