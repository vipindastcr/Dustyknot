const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    
    rating:{
        type:Number,
        default:5,
    },
    comment:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    website:{
        type:String,
        required:false,
    },
    reference:{
        type:String,
        // required:true,
    }
    
})


module.exports = mongoose.model('reviewSchema',reviewSchema)