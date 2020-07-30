const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello WorKn!!!');
});

const port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log('App listening on port ' + port);
});
