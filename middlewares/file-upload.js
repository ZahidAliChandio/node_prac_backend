const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  //   limits - size of file 500k bytes
  limits: 500000,
  storage: multer.diskStorage({
    // file - file that was extracted.
    // cb - callback
    destination: (req, file, cb) => {
      //error can be printed at the place of null
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + "." + extension);
    },
  }),
  // To allow only accepted extensions to be uploaded.
  // As frontend can be changed from developers tools(inspect) by user.
  fileFilter: (req, file, cb) => {
    // !! converts undefined or null to false.
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
