const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const organizationRouter = require('./routes/organizationRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//---Global Middlewares---

//CORS
app.use(cors());

//Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Body parser (reading data from body into req.body. Limit data size.)
app.use(express.json({ limit: '10kb' }));

//---Routes---

app.use('/api/v1/users', userRouter);
app.use('/api/v1/organizations', organizationRouter);

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
