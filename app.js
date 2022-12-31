const fs = require("fs");
const path = require("path");

// app.js refers to server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

mongoose.set("strictQuery", false);
const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

// To allow CORS (its due to browser security)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  //Which headers incoming request may have
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Acces,Authorization"
  );
  // Which http methods may be attached to the incoming requests.
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH", "DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// If unsupported route is entered.
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// If some error occurs
app.use((error, req, res, next) => {
  // multer adds this file property to req.
  // To rollback transaction if error at any point occurs.
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

// process.env code is in nodemon.js
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6v73fea.mongodb.net/?retryWrites=true&w=majority`
  )

  .then(() => {
    app.listen(8000, () => {
      console.log("Connected to DB Successfully");
    });
  })
  .catch((error) => {
    console.log(error);
  });
