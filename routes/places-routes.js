const express = require("express");

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
  console.log("Places get request called");
  res.json({ place }); //=> {place} => {place:place}
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const user = PLACES.filter(
    (u) => u.creater === userId
    // return u.creater === userId;
  );
  res.json({ user });
});

module.exports = router;
