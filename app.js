const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

//---Global Middlewares---

//CORS
app.use(cors());

//Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//---Routes---

//Temporal endpoint
app.get('/', function (req, res) {
  res.send('Hello WorKn!!!');
});

//---Error handling---

//---App export---
module.exports = app;
