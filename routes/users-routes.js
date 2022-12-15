const express = require("express");

const { getUsers, login, signup } = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", getUsers);
router.post("/login", login);
router.post("/signup", signup);

module.exports = router;
