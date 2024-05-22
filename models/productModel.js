const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
       salesPrice:{type:Number,default:0,required:true},
    //    regularPrice:{type:Number,required:true}
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    image:{
        type:Array,
        
    },
    isActive:{
        type:Boolean,
        default:true
    },
    size:{
        s:{
            quantity:{
                type:Number,
                required:true
            }
        },
        m:{
            quantity:{
                type:Number,
                required:true
            }
        },
        l:{
            quantity:{
                type:Number,
                required:true
            }
        }
    },
    productstatus:{
        type:Boolean,
        default:true,

    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('Product',productSchema)