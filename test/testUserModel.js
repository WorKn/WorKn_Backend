const Model = require('../models/tagModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

new_element = {
  name: 'Yordi Ogando',
  email: 'balbla@gmail.com',
  identificationNumber: '12345678910',
  password: '123456878',
  passwordConfirm: '123456878',
  // userType: 'offerer',
  userType: 'applicant',
  birthday: '2003-09-12',
  category: 'Tecnologa',
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

new_element2 = {
  name: 'Yordi Ogando',
  email: 'balbla@gmail2.com',
  identificationNumber: '12345678910',
  password: '123456878',
  passwordConfirm: '123456878',
  // userType: 'offerer',
  userType: 'applicant',
  birthday: '2003-09-12',
  category: 'Tecnologa',
  location: {
    coordinates: [13.25, 25.002],
    address: 'calle 4',
  },
  tags: [
    // {
    //   name: 'tag1',
    //   category: { name: 'category1' },
    // },
    {
      name: 'tag1',
      category: { name: 'category1' },
    },
  ],
};
testModel(new_element, Model);
