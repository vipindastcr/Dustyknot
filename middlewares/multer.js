const multer = require("multer");
const path = require('path')

const productStorage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,'../uploads'))
  } 
  ,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const productUpload = multer({
  storage: productStorage,
});

module.exports = {
  productUpload,
};