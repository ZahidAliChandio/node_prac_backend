const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middlewares/check-auth");

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../controllers/places-controllers");
const fileUpload = require("../middlewares/file-upload");

const router = express.Router();

// :placeId means the dynamic Ids to be passed.

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlacesByUserId);

// Adding middleware here means above routes are open to everyone

// Token Authorization
router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [check("title").not().isEmpty()],
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
  createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlace
);

router.delete("/:pid", deletePlace);

module.exports = router;
