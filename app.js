// app.js refers to server.js

const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const { Router } = require("express");

const app = express();
const router = Router();
app.use(placesRoutes, (req, res, next) => {
  console.log("working");
});

app.listen(5000);
