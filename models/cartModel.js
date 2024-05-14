const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    user:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    products:[
        {
        productItemId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
        },
        price:{
            type:Number
        },
        size:{
            type:String,
            default:"m",
        }
    }],
    totalPrice:{
        type:Number
    }

})

// module.exports = mongoose.model('Cart',cartSchema)

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;