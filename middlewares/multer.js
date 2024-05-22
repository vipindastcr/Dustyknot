const multer = require("multer");
const path = require('path');

// Define a function to generate a unique filename
const generateUniqueFilename = (file) => {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  return `${timestamp}-${Math.floor(Math.random() * 10000)}${extension}`;
};

// Configure Multer storage
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueFilename = generateUniqueFilename(file);
    cb(null, uniqueFilename);
  },
});

// Set up Multer middleware
const productUpload = multer({
  storage: productStorage,
});

module.exports = {
  productUpload,
};
