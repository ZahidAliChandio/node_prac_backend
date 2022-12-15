const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

const USERS = [
  {
    id: "u1",
    name: "Zahid Ali",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: USERS });
};

const signup = (req, res, next) => {
  const { userName, email, password } = req.body;

  const alreadyRegistered = USERS.find((u) => u.email === email);

  if (alreadyRegistered) {
    // 422 => in
    throw new HttpError("Email is already registered!", 422);
  }
  const createdUser = {
    id: uuidv4(),
    userName,
    email,
    password,
  };

  USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    // 401 => wrong credentials
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
  }
  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
