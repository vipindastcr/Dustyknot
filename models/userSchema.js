const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
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
    address:[
        {
            housename:{
                type:String
            },
            streetname:{
                type:String
            },
            areaname:{
                type:String
            },
            districtname:{
                type:String
            },
            statename:{
                type:String
            },
            countryname:{
                type:String
            },
            pin:{
                type:Number
            }
        }
    ],
    isActive:{
        type:Boolean,
        default:true
    },

    wallet: {
        balance: { type: Number, default: 0 },
        details: [
          {
            type: { type: String, enum: ["credit", "debit", "refund"] },
            amount: { type: Number },
            date: { type: Date },
            transactionId: {
              type: Number,
              default: function () {
                return Math.floor(100000 + Math.random() * 900000);
              },
            },
          },
        ],
      },

})

const User=mongoose.model('User',userSchema)
module.exports=User