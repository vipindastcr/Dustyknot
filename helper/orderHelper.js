const cartModel = require("../models/cartModel")
const userModel = require("../models/userSchema")
const productModel = require("../models/productModel")
const orderModel = require("../models/orderModel")
const { ObjectId } = require('mongodb');





const placeOrder = (data, userId) => {
    console.log("orderHelper_ place order function");

    return new Promise (async (resolve,reject) => {
      //  console.log("userId : ",userId);
       try {
                
                // let userId = new ObjectId(user_Id);
                // console.log("userId : is ", userId);
                const cart = await cartModel.findOne( { user: userId} );
                console.log("> cart is ::::::::::::::::::::::::::::::::::::::::::::::: ",cart);
                console.log("userId : is ", userId) 
                const address = await userModel.findOne(
                    { _id: userId, "address._id": data.addressId},
                    { "address.$":1,
                        _id:0,
                    }
                )
                console.log("address>>...... "+address);
                const user = await userModel.findOne({ _id:userId });
                console.log(" showing cart : >>> ----",cart);
                console.log("finished cart ===========================");
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

                    // let changeStock = await productModel.updateOne(
                    //     { _id: product.productId },
                    //     {
                    //     $inc: {
                    //       [`size.${product.size}.quantity`]: -product.quantity,
                    //       // totalQuantity: -product.quantity
                          
                    //     } 
                    //     }
                    // )
                    let productSize = product.size.toLowerCase()
                    let changeStock = await productModel.findOne(
                      { _id: product.productItemId});
                      
                   console.log('changeStock',changeStock);
                   let stock = changeStock.size
                  console.log('stock',stock);
                  console.log('stock[product.size]',stock[productSize]);
                  stock[productSize].quantity = stock[productSize].quantity-product.quantity;
                  console.log("balance stock of this product : > ",stock[productSize].quantity);
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
        console.log(singleOrderDetails);
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
        //   {
        //     $addFields: {
        //         orderedTime: "$createdAt" 
        //     }
        // }
          
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
  console.log("> here orderHelper getAllorders | <");
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

      // console.log("result : > "+result);
    if (result) {
      resolve(result);
    }
  });
};

const changeOrderStatusOfEachProduct = (orderId, productId, status) => {

  console.log(orderId," - ",productId," - status >> ",status);
  return new Promise(async (resolve, reject) => {
    try {
      const result = await orderModel.findOneAndUpdate(
        { _id: new ObjectId(orderId), "products._id": new ObjectId(productId) },
        {
          $set: { "products.$.status": status },
        },
        { new: true }
      );

      const result2 = await orderModel.findOneAndUpdate(     // added extra for testing purposes
        { _id: new ObjectId(orderId)},
        {
          $set: { "status": status },  // 
        },
        { new: true }
      );
      console.log("the result1 and result2  are .............>>>",result,"------",result2);
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
    console.log(startDate,endDate,"=======>")
    const startDateSort = new Date(startDate);
    const endDateSort = new Date(endDate);
    console.log("startDateSort :", startDateSort,"||  endDateSort  :", endDateSort);

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
        { $sort: { orderedOn: 1 }},  // here,1 for ascending order, -1 for descending
    ])
    console.log("result is,,,,",result)
    return result 
  } catch (error) {
    console.log("Error", error);
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