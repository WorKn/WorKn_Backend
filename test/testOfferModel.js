const Model = require('../models/offerModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

elementTest = {
    tittle: "Desarrollador de mongo",
    description: "Busco a alguien que sepa de mongo, de preferencia que me haga batidas de mango",
    offerType: 'contract',
    location: {
        coordinates: [13.25, 25.002],
        address: 'calle 4',
    },
    owner: '',
    organization: '',
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
    category: '',
    salaryRange: [500,50000]
}



testModel(elementTest, Model);