const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const USERS = [
  {
    id: "u1",
    name: "Zahid Ali",
    email: "test@test.com",
    password: "testers",
  },
];

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
  const createdUser = new User({
    name,
    email,
    image:
      "https://images.unsplash.com/photo-1597431842922-d9686a23baa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3MTcxMDI0Mg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080",
    password,
    places: [],
  });
  try {
    await createdUser.save();
  } catch {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

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
  if (!alreadyRegistered || alreadyRegistered.password !== password) {
    // 401 => wrong credentials
    const error = new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
    return next(error);
  }
  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
