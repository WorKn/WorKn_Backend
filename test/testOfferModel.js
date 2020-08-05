const Model = require('../models/offerModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

//Applicant creating offer // 
elementTest = {
    tittle: "Desarrollador de mongo",
    description: "Busco a alguien que sepa de mongo, de preferencia que me haga batidas de mango",
    offerType: 'contract',
    location: {
        coordinates: [13.25, 25.002],
        address: 'calle 4',
    },
    createdBy: '5f2b1696fb38ae081c9744df',
    //organization: '5f2b3166a3917960d08deca0',
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
    category: '5f2375264620f36c4ba15a7c',
    salaryRange: [500,50000]
}
//normal creation
elementTest2 = {
    tittle: "Desarrollador de mongo",
    description: "Busco a alguien que sepa de mongo, de preferencia que me haga batidas de mango",
    offerType: 'contract',
    location: {
        coordinates: [13.25, 25.002],
        address: 'calle 4',
    },
    createdBy: '5f2b1696fb38ae081c9744df',
    //organization: '5f2b3166a3917960d08deca0',
    tags: [
        {
          name: 'tag1',
          category: { name: 'category1' },
        },
        {
          name: 'tag2',
          category: { name: 'category2' },
        },
        {
            name: 'tag3',
            category: { name: 'category3' },
        },
        {
            name: 'tag4',
            category: { name: 'category4' },
        },
      ],
    category: '5f2375264620f36c4ba15a7c',
    salaryRange: [500,50000]
}


testModel(elementTest2, Model);