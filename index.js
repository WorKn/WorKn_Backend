const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

app.get("/", function (req, res) {
  res.send("Hello WorKn!");
});

app.listen(3000, function () {
  console.log("App listening on port 3000!");
});
