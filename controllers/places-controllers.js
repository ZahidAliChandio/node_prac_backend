const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.");
  }

  console.log("Places get request called");
  res.json({ place }); //=> {place} => {place:place}
};

// Error: next is used in asynchronus program and throw Error is used in Syn.

// There can by more than one place created by single user.
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = PLACES.filter(
    (p) => p.creator === userId
    // return u.creater === userId;
  );
  if (!places) {
    // return res.status(404).json({ message: "Could not find place" });
    return next(new Error("Could not find places for the provided id.", 4040));

    // error.code = 404; //these lines were before creating errorClass
    // return next(error);
  }
  res.json({ places });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find the place", 404);
  }
  PLACES = PLACES.filter((p) => p.id !== placeId);
  res.status(201).json({ PLACES: PLACES });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 Invalid inputs
    res.status(422);
    throw new HttpError("Invalid inputs passed, please check your inputs", 422);
  }
  const placeId = req.params.pid;
  const placeIndex = PLACES.findIndex((p) => p.id === placeId);
  const { title, description, coordinates, address, creator } = req.body;
  // const updatedPlaces = [...PLACES];

  // const updatedPlace = PLACES[placeIndex]; //or the bottom one
  const updatedPlace = { ...PLACES.find((p) => (p.id = placeId)) };
  // const updatedPlace = updatedPlaces[placeIndex];
  updatedPlace.title = title;
  updatedPlace.description = description;
  updatedPlace.coordinates = coordinates;
  updatedPlace.address = address;
  updatedPlace.creator = creator;
  // updatedPlaces[placeIndex] = updatedPlace;
  // PLACES = updatedPlaces;
  PLACES[placeIndex] = updatedPlace;
  res.status(201).json({ PLACES: PLACES });
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
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  PLACES.push(createdPlace); // or unshift(createdPlace)

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
