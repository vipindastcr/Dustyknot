const Jimp = require('jimp');
const productModel = require('../models/productModel');
const fs = require('fs')



const validateImage = async(req,res,next) => {
    try {
        const buffer = req.files ? req.files[0].buffer : null;
        if (!buffer) {
            throw new Error("No image uploaded or buffer is not available");
        }
        
        const image = await Jimp.read(req.files.buffer);
        
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        if ( width < 100 || height < 100 || width > 2000 || height > 2000 ) {
            throw new Error('Image dimensions are not within acceptable range (100x100 to 2000x2000)');
        }

        const validFormats = ['jpg','png','gif'];
        const format = image.getExtension().toLowerCase();

        if(!validFormats.includes(format) ) {
            throw new Error('Invalid image format. Supported formats: JPEG, PNG, GIF');
        }

        next();

    } catch (error) {
        console.log(error);
        if(req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).send({ error: error.message });
    }
}


module.exports = {
    validateImage,
}