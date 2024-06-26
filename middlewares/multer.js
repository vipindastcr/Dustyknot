const multer = require("multer");
const path = require('path');

const generateUniqueFilename = (file) => {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  return `${timestamp}-${Math.floor(Math.random() * 10000)}${extension}`;
};

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file);
    cb(null, uniqueFilename);
  },
});

const productUpload = multer({
  storage: productStorage,
});

module.exports = {
  productUpload,
};
