const express = require("express");

const router = express.Router();

const USERS = [
  {
    id: "u1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484472,
      long: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 1001",
  },
];

router.get("/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const user = USERS.find((u) => {
    return u.id === userId;
  });
  console.log("User get request Called");
  res.json({ user });
});

module.exports = router;
