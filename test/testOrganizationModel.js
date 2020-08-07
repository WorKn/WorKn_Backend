const Model = require('../models/organizationModel');
const mongoose = require('mongoose');
const dbConection = require('./dbConection');
const testModel = require('./testModel');

elementTest = {
    name: "tinderin",
    RNC: "40536845429",
    verified: true,
    location: {
        coordinates: [13.25, 25.002],
        address: 'calle 4',
    },
    phone: '8296938574',
    email: 'yonosemanana@manana.com',
    members: ['5f2b1696fb38ae081c9744df'],
    hasLicense: true,
}



testModel(elementTest, Model);