const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:true
    },
    isActive:{
        type:Boolean,
        required:true
    }
})

const admin = mongoose.model('Admin',adminSchema);

module.exports = admin;