const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

const PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484472,
      long: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 1001",
    creator: "u1",
  },
];

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

  console.log("Places get request called");
  // mongoose adds an id getter to every document which returns id as a string
  // such getters are lost when we call to object
  // with getters:true we can avoid this.
  res.json({ place: place.toObject({ getters: true }) }); //=> {place} => {place:place}
};

// Error: next is used in asynchronus program and throw Error is used in Syn.

// There can by more than one place created by single user.
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  // const places = PLACES.filter(
  //   (p) => p.creator === userId
  //   // return u.creater === userId;
  // );
  let places;
  try {
    // - In MongoDb
    // find returns cursor - cursor points to the find() results
    // And it alows to iterate through different results we would have.
    // It will return big amount of data - load
    // - In Mongoose
    // find() does not provide a cursor but directly an Array.
    // to do so, we can use cursor property on our own.
    places = Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("Fetching place faild, try again later.", 500);
    return next(error);
  }
  if (!places) {
    // return res.status(404).json({ message: "Could not find place" });
    return next(new Error("Could not find places for the provided id.", 404));

    // error.code = 404; //these lines were before creating errorClass
    // return next(error);
  }
  res.json({ places: places.map((p) => p.toObject({ getters: true })) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    await Place.findByIdAndDelete(placeId);
  } catch (err) {
    const error = new HttpError("Could not delete Place", 500);
    return next(error);
  }
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
  const { title, description, coordinates, address, creator } = req.body;
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
  place.coordinates = coordinates;
  place.address = address;
  place.creator = creator;

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
    image:
      "https://img.traveltriangle.com/blog/wp-content/uploads/2021/11/shutterstock_1487009060.jpg",
    creator,
  });
  // PLACES.push(createdPlace); // or .unshift(createdPlace)
  try {
    await createdPlace.save();
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
