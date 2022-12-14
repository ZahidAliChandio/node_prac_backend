// app.js refers to server.js

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.listen(5000);
