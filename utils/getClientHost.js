const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const getClientHost = (req) => {
  if (req.headers.origin && req.headers.origin.startsWith('http://localhost')) {
    return req.headers.origin;
  } else return process.env.FRONTEND_HOST;
};

module.exports = getClientHost;
