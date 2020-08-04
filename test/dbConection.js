const mongoose = require('mongoose');
const app = require('../app');

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
module.exports = mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connection successfully established.'));
