const axios = require("axios");

const HttpError = require("../models/http-error");

// encodeURIComponent
// it will encode argument to url friendly format.
// to get rid of special characters or white space.

async function getCoordsForAddress(address) {
  //   return {
  //     lat: "",
  //     lng: "",
  //   };
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );

  const data = response.data;

  //   422 invalid user inputs.
  //    below are CONDITIONS given in google map api docs.
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("Could not find specified location", 422);
    throw error;
  }
  console.log(data);

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
