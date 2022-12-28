const express = require("express");
const { check } = require("express-validator");

const { getUsers, login, signup } = require("../controllers/users-controllers");
const fileUpload = require("../middlewares/file-upload");

const router = express.Router();

router.get("/", getUsers);
router.post("/login", login);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() //Test@test.com =>(converted to) test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);

module.exports = router;
