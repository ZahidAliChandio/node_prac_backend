const express = require("express");

const HttpError = require("../models/http-error");
const {
  getPlaceById,
  getPlaceByUserId,
} = require("../controllers/places-controllers");

const router = express.Router();

// :placeId means the dynamic Ids to be passed.

router.get("/:pid", getPlaceById);

// Error: next is used in asynchronus program and throw Error is used in Syn.

router.get("/user/:uid", getPlaceByUserId);

module.exports = router;
