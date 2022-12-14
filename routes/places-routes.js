const express = require("express");

const HttpError = require("../models/http-error");

const router = express.Router();

const PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484472,
      long: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 1001",
    creater: "u1",
  },
];

// :placeId means the dynamic Ids to be passed.

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.");
  }

  console.log("Places get request called");
  res.json({ place }); //=> {place} => {place:place}
});

// Error: next is used in asynchronus program and throw Error is used in Syn.

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = PLACES.filter(
    (p) => p.creater === userId
    // return u.creater === userId;
  );
  if (!place) {
    // return res.status(404).json({ message: "Could not find place" });
    return next(new Error("Could not find a place for the provided id.", 4040));

    // error.code = 404; //these lines were before creating errorClass
    // return next(error);
  }
  res.json({ place });
});

module.exports = router;
