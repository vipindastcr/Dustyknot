const cartModel = require("../models/cartModel")
const userModel = require("../models/userSchema")
const productModel = require("../models/productModel")
const orderModel = require("../models/orderModel")
const { ObjectId } = require('mongodb');





const placeOrder = (data, userId) => {
    return new Promise (async (resolve,reject) => {
       try {
                const cart = await cartModel.findOne( { user: userId} );
                const address = await userModel.findOne(
                    { _id: userId, "address._id": data.addressId},
                    { "address.$":1,
                        _id:0,
                    }
                )
                const user = await userModel.findOne({ _id:userId });
                let products = [];
                let status = "pending";
                if(data.status) {
                  console.log(" inside if data.status");
                    status = "payment pending"
                }

                for (const product of cart.products) {
                    products.push({
                        product: product.productItemId,
                        quantity: product.quantity,
                        size: product.size,
                        productPrice: product.price,
                        status: status,
                    });

                    let productSize = product.size.toLowerCase()
                    let changeStock = await productModel.findOne(
                      { _id: product.productItemId});
                      
                  let stock = changeStock.size
                  stock[productSize].quantity = stock[productSize].quantity-product.quantity;
                  await changeStock.save()
                }
                

                if( cart && address ) {
                    const result = orderModel.create({
                        user: userId,
                        products: products,
                        address: {
                            name: user.name,
                            house: address.address[0].housename,
                            street: address.address[0].streetname,
                            area: address.address[0].areaname,
                            district: address.address[0].districtname,
                            state: address.address[0].statename,
                            country: address.address[0].countryname,
                            pin: address.address[0].pin,
                            mobile: user.mobile,
                        },
                        paymentMethod: data.paymentOption,
                        totalAmount: data.totalAmount,
                    })

                    resolve ({result: result, status: true})
            }

        }catch(error){
            console.log(error);
        }

    })
}


const getOrderDetails = (userId) => {

    return new Promise (async(resolve,reject) => {
        try {

                const orderDetails = await orderModel
                .find({ user: userId })
                .sort({ orderedOn: -1 });

                resolve(orderDetails)

        } catch (error) {
            console.log(error.message);
        }
    })
}


const getSingleOrderDetails = (orderId) => {
  
    return new Promise(async (resolve, reject) => {
      try {
        const singleOrderDetails = await orderModel.aggregate([
          {
            $match: {
              _id: new ObjectId(orderId),
            },
          },
          {
            $project: {
              user: 1,
              totalAmount: 1,
              paymentMethod: 1,
              orderedOn: 1,
              status: 1,
            },
          },
        ]);
        
        resolve(singleOrderDetails);
      } catch (error) {
        console.log(error);
      }
    });
};


const getOrderDetailsOfEachProduct = (orderId) => {
   
    return new Promise(async (resolve, reject) => {
      try {
        const orderDetails = await orderModel.aggregate([
          
          {
            $match: {
              _id: new ObjectId(orderId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "orderedProduct",
            },
          },
          {
            $unwind: "$orderedProduct",
          },
          
        ]);
        let check = true;
        let count = 0;
  
        for (const order of orderDetails) {
          if (order.products.status == "delivered") {
            check = true;
            count++;
          } else if (order.products.status == "cancelled") {
            check = true;
          } else {
            check = false;
            break;
          }
        }
        if (check == true && count >= 1) {
        orderDetails.deliveryStatus = true;
        }
       
        
  
        resolve(orderDetails);
      } catch (error) {
        console.log(error);
      }
    });
};

const cancelSingleOrder = (orderId,singleOrderId,price) => {
  return new Promise(async (resolve,reject) => {
    try {

      const cancelled = await orderModel.findOneAndUpdate(
        {
          _id: new ObjectId(orderId),
          "products._id": new ObjectId(singleOrderId),
        },
        {
          $set:{ "products.$.status": "cancelled"}
        },
        {
          new:true,
        }
      );

      const result = await orderModel.aggregate([
        {
          $unwind: "$products",
        },
        {
          $match: {
            _id: new ObjectId(orderId),
            "products._id": new ObjectId(singleOrderId),
          },
        },
      ]);


      const singleProductId = result[0].products.product;
        const singleProductSize = result[0].products.size;
        const singleProductQuantity = result[0].products.quantity;
  
        const stockIncrease = await productModel.updateOne(
          { _id: singleProductId, "productQuantity.size": singleProductSize },
          {
            $inc: {
              "productQuantity.$.quantity": singleProductQuantity,
              totalQuantity: singleProductQuantity,
            },
          }
        );
        
  
        resolve(cancelled);
      
    } catch (error) {
      console.log(error);
    }
  })
}

const getAllOrders = () => {
  return new Promise(async (resolve, reject) => {
    const result = await orderModel
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userOrderDetails",
          },
        },
      ])
      .sort({ orderedOn: -1 });

    if (result) {
      resolve(result);
    }
  });
};

const changeOrderStatusOfEachProduct = (orderId, productId, status) => {

  return new Promise(async (resolve, reject) => {
    try {
      const result = await orderModel.findOneAndUpdate(
        { _id: new ObjectId(orderId), "products._id": new ObjectId(productId) },
        {
          $set: { "products.$.status": status },
        },
        { new: true }
      );

      const result2 = await orderModel.findOneAndUpdate(  
        { _id: new ObjectId(orderId)},
        {
          $set: { "status": status },  // 
        },
        { new: true }
      );
      resolve(result);
    } catch (error) {
      console.log(error);
    }
  });
};



const salesReport = async() => {
  
  try {
      const result = await orderModel.aggregate([
        { $unwind: "$products"},
        { $match: { "products.status": "delivered" }},
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productDetails"
          }
        }
      ]);

    return result
    
  } catch (error) {
    console.log("error",error);
    throw error;

  }
}


const salesReportDateSort = async (startDate,endDate) => {
  try {
    const startDateSort = new Date(startDate);
    const endDateSort = new Date(endDate);

    function getNextDay(date) {
      const nextDay = new Date(date);
      nextDay.setDate( nextDay.getDate() + 1);

      return nextDay;
    }

    const endDateSortPlusOneDay = getNextDay(endDateSort);

    const result = await orderModel.aggregate([
        {
          $match: {
            orderedOn: { $gte: startDateSort, $lt: endDateSort }
          },
        },
        { $unwind: "$products" },
        { $match: { "products.status":"delivered" }},
        {
          $lookup: {
              from:"products",
              localField: "products.product",
              foreignField:"_id",
              as: "productDetails",
          }
        },
        { $sort: { orderedOn: 1 }},
    ])
    return result 
  } catch (error) {
    throw error;
  }
}
 
module.exports = {
    placeOrder,
    getOrderDetails,
    getSingleOrderDetails,
    getOrderDetailsOfEachProduct,
    cancelSingleOrder,
    getAllOrders,
    changeOrderStatusOfEachProduct,
    salesReport,
    salesReportDateSort,

}