const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
// const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); //bottom approach is also aplicable.
    // const users=User.find({},'email name'); //This also works fine
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check your data", 422));
  }
  const { name, email, password } = req.body;

  let alreadyRegistered;
  try {
    alreadyRegistered = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Database Search failed, please try again later.",
      500
    );
    return next(error);
  }

  if (alreadyRegistered) {
    const error = new HttpError(
      "Email is already registered, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
  try {
    await createdUser.save();
  } catch {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  let token;
  // id is mongodb auto generated id for this user.
  // supersecret_dont_share is private key that only the server knows.
  // Which you never ever share with any client.
  // last argument is optional - configure the token eg:token expiry
  // letting the token to expire is recomended.
  // does not return promise but could fail - try,catch
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  res.status(201).json({
    userId: createdUser.id,
    userName: createdUser.name,
    email: createdUser.email,
    token: token,
    places: createdUser.places,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let isRegistered;
  try {
    isRegistered = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Database Search failed, please try again later.",
      500
    );
    return next(error);
  }
  // if (!isRegistered || isRegistered.password !== password) {
  if (!isRegistered) {
    // 401 => wrong credentials
    const error = new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, isRegistered.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log in, credentials seem to be wrong.",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      500
    );
    return next(error);
  }
  let token;
  // id is mongodb auto generated id for this user.
  // supersecret_dont_share is private key that only the server knows.
  // Which you never ever share with any client.
  // last argument is optional - configure the token
  // letting the token expire is recomended.
  // does not return promise but could fail - try,catch
  try {
    token = jwt.sign(
      { userId: isRegistered.id, email: isRegistered.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }
  res.json({
    message: "Logged in!",
    users: isRegistered.toObject({ getters: true }),
    userId: isRegistered.id,
    email: isRegistered.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
