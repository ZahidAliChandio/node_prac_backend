const express = require("express");

const {
  getPlaceById,
  getPlaceByUserId,
  createPlace,
} = require("../controllers/places-controllers");
const { application } = require("express");

const router = express.Router();

// :placeId means the dynamic Ids to be passed.

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlaceByUserId);

router.post("/", createPlace);

module.exports = router;
