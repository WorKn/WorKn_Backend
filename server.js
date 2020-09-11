const mongoose = require('mongoose');
const app = require('./app');
const ioConnect = require('./controllers/chatController');

//Unhandled Exceptions handling
process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception. Shutting dow...');
  console.log(err.name, err.message);
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

//Set Database host
let DB = '';

if (process.env.NODE_ENV === 'development') {
  DB = process.env.DATABASE_HOST_LOCAL;
} else if (process.env.NODE_ENV === 'staging') {
  DB = process.env.DATABASE_HOST.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
  DB = DB.replace('<DATABASE_NAME>', process.env.DATABASE_NAME);
}

//Establish database connection
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connection successfully established.'));

//Start server
const port = process.env.PORT || 8080;

const server = app.listen(port, function () {
  console.log('App listening on port ' + port + '...');
});

ioConnect(server);

//Rejected promises handling
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection. Shutting dow...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
