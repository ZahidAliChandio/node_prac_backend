const multer = require("multer");
const uuid = require("uuid/dist/v4");

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
      const extension = MIME_TYPE_MAP(file.mimetype);
      cb(null, uuid() + "." + ext);
    },
  }),
  //   fileFilter:
});

module.exports = fileUpload;
