const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  // browser first send the option request to check to allow the reqeuest.
  //   We are making it to go a head.
  if (req.method === "OPTIONS") {
    return next();
  }
  // Query can also be used eg: ?token=token;
  // We will be using headers.
  // As we allowed client to send authorization header in with request - app.js.
  // Token is stored in Authorization as Authorization: 'Bearer TOKEN'

  //   If we split it and authorization header is not set at all.
  //  This would .split would crash and generate an error.
  //   Instead of just returning undefined for the token.
  try {
    const token = req.headers.authorization.split(" ")[1];
    // if token is invalid.
    if (!token) {
      throw new HttpError("Authentication failed!");
    }
    // decodedToken - Payload that was encoded into that token.
    // We stored/added email and id in the token's payload.
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    // We can always dynamically add data to req body.
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    //catch - if authorization header is not set and split() crashes.
    // 403 invalid credentials
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};
