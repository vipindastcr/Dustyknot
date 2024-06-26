const mongoose = require("mongoose")


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    products: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
          },
          size: {
            type: String,
          },
          productPrice: {
            type: Number,
          },
          status: {
            type: String,
            enum: [
              "pending",
              "processing",
              "confirmed",
              "outForDelivery",
              "shipped",
              "delivered",
              "cancelled",
              "return pending",
              "returned",
              "payment pending",
            ],
            default: "pending",
          },
        },
      ],
      address: {
        name: String,
        house: String,
        street: String,
        area: String,
        district: String,
        state: String,
        country: String,
        city: String,
        pin: Number,
        mobile: Number,
      },
      paymentMethod: {
        type: String,
      },
      orderedOn: {
        type: Date,
        default: Date.now,
      },
      deliveredOn: {
        type: Date,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "confirmed",
          "outForDelivery",
          "shipped",
          "delivered",
          "cancelled",
          "return pending",
          "returned",
          "payment pending",
        ],
        default: "pending",
      },
      orderId: {
        type: Number,
        default: Math.floor(100000 + Math.random() * 900000)
      },
      totalAmount: {
        type: Number,
      },
      couponAmount: {
        type: Number,
        default: 0,
      }
},{
    timestamps: true
})


const Order = mongoose.model("Order",orderSchema)

module.exports = Order;