const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

//---App export---
module.exports = app;
