const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');

const userRouter = require('./routes/userRoutes');
const organizationRouter = require('./routes/organizationRoutes');
const offerRouter = require('./routes/offerRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const tagRouter = require('./routes/tagRoutes');
const recommendationRouter = require('./routes/recommendationRoutes');
const statRouter = require('./routes/statRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const socketConnection = require('./utils/socketConnection');

const app = express();
const server = http.createServer(app);

let io = require('socket.io').listen(server);
io = socketConnection(io);

app.set('socketio', io);

//---Global Middlewares---

//CORS
app.use(cors());

//Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Body parser (reading data from body and cookies into req.body and req.cookies, limit data size)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//---Routes---

app.use('/api/v1/users', userRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/recommendations', recommendationRouter);
app.use('/api/v1/stats', statRouter);

//Temporal endpoint
app.get('/', function (req, res) {
  res.send('Hello WorKn!!!');
});

//---Error handling---
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

//---Export---
module.exports = server;
