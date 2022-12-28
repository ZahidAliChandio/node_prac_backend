const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  // findById.exec() will return a promise.
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    // If we have general some kind of problem, may be missing information.
    const error = new HttpError("Fetching place faild, try again later.", 500);
    return next(error);
  }

  // If we just don't have that place in our database;
  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
  // mongoose adds an id getter to every document which returns id as a string
  // such getters are lost when we call to object
  // with getters:true we can avoid this.
  res.json({ place: place.toObject({ getters: true }) }); //=> {place} => {place:place}
};

// Error: next is used in asynchronus program and throw Error is used in Syn.

// There can by more than one place created by single user.
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // const places = PLACES.filter(
  //   (p) => p.creator === userId
  //   // return u.creater === userId;
  // );

  // Approach 1
  let places;
  // try {
  //   // - In MongoDb
  //   // find returns cursor - cursor points to the find() results
  //   // And it alows to iterate through different results we would have.
  //   // It will return big amount of data - load
  //   // - In Mongoose
  //   // find() does not provide a cursor but directly an Array.
  //   // to do so, we can use cursor property on our own.
  //   places = await Place.find({ creator: userId });
  // } catch (err) {
  //   const error = new HttpError("Fetching place faild, try again later.", 500);
  //   return next(error);
  // }

  // Approach 2
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError("Fetching place faild, try again later.", 500);
    return next(error);
  }

  // Approach 1
  // if (!places places.length===0) {
  // Approach 2
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    // return res.status(404).json({ message: "Could not find place" });
    return next(new Error("Could not find places for the provided id.", 404));

    // error.code = 404; //these lines were before creating errorClass
    // return next(error);
  }
  // Approach 1
  // res.json({ places: places.map((p) => p.toObject({ getters: true })) });
  // Apporach 2
  res.json({
    places: userWithPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  // We need to delete place id from User also
  // We need to access to a user document and override our change.
  // For this populate is used.
  // And for this we need relation b/w these documents.
  let place;
  try {
    // await Place.findByIdAndDelete(placeId);
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete Place",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could not find place for provide id.", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, Could not delete place",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Deleted place." });
};
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 Invalid inputs
    res.status(422);
    return new HttpError(
      "Invalid inputs passed, please check your inputs",
      422
    );
  }
  const placeId = req.params.pid;
  // const placeIndex = PLACES.findIndex((p) => p.id === placeId);
  const { title, description } = req.body;
  // const updatedPlaces = [...PLACES];

  // const updatedPlace = PLACES[placeIndex]; //or the bottom one
  // const updatedPlace = { ...PLACES.find((p) => (p.id = placeId)) };
  // const updatedPlace = updatedPlaces[placeIndex];
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not update place, try again later.");
    return next(error);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
  }
  // updatedPlaces[placeIndex] = updatedPlace;
  // PLACES = updatedPlaces;
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// async is used because we are using await in getCoordinates;
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 Invalid inputs
    res.status(422);
    // next is used becaue throw does works well with async
    return next(
      new HttpError("Invalid inputs passed, please check your inputs", 422)
    );
  }
  const { title, description, address, creator } = req.body;
  // let coordinates;
  let coordinates = {
    lat: 40.740736,
    lng: -73.9861576,
  };
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  // To check, if we have that user in our User collection.
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    // User not found
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }
  if (user) {
    console.log("user found");
  }
  // User not found
  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  // Now we have to save place and add place id to User document too
  // If both things succeeds then we want to continue and change our document.
  // For this we need to use sessions and transections.
  // Transaction - Perform mutliple operation in isolation of each other
  // and to undo these operations.
  // Transactions are build on sessions.
  // To work with Transactions we first have to start a session.
  // One transection is succesfull session is finished.
  // And tha transaction is commited (operations successeded)
  try {
    // For transactions if collection does not exist.
    // Then we have to create collection manaully.
    // As at start we don't have any collection.
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
