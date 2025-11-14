import multer from "multer";

// Set up how and where files will be stored locally
const storage = multer.diskStorage({
  // Folder where uploaded files will be temporarily saved
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // store files in public/temp folder
  },

  // Set the file name after saving
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use the original file name
  }
});

// Create the multer instance with the above storage settings
export const upload = multer({
  storage,
});
