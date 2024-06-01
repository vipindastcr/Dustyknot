const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

// const ObjectId = require("mongoose").Types.ObjectId;
const { ObjectId } = require('mongoose');
// const mongoose = require("mongoose");
// const ObjectId = mongoose.Types.ObjectId;


//addtocart in cartHelper
//old one in case
// const addToCart = (userId, productId, size)=> {
//     console.log("reached here<<<000>>>");
//     console.log("reached here at cartHelper || userId, productId, size >> "+userId+"  "+productId+"  "+size);
//     return new Promise(async(resolve,reject)=> {
//         const product = await productModel.findOne({ _id: productId });
//         console.log('helper >',product);    
//         const existingCartItem = await cartModel.findOne({
//             user: userId,
//             "products.productItemId":productId,
//             "products.size":size
//         })

//         if(!existingCartItem) {
//             const cart = await cartModel.updateOne(
//                 {
//                     user:userId,
//                 },
//                 {
//                     $push:{
//                         products: {
//                             productItemId:productId,
//                             quantity:1,
//                             size:size,
//                             price:product.price.salesPrice,
//                         }
//                     }
//                 },
//                 { upsert: true }

//             );

//             console.log(cart);
//             resolve(cart)
//         }else {
//             await cartModel.updateOne(
//                 { user:userId,"products.productItemId":productId, "products.size":size },
//                 { $inc: { "products.$.quantity":1 }}
//             );
//             const updatedCart = await cartModel.findOne({
//                 user:userId,
//                 "products.productItemId":productId,
//                 "products.size":size
//             });
//             resolve(updatedCart)
//         }

//     })
// }


//new code
const addToCart = (userId, productId, size) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await productModel.findOne({ _id: productId });
            const maxQuantityPerPerson = 3; // only 3 unit per person limited

            // Check if the requested quantity exceeds the maximum allowed per person
            const existingCartItem = await cartModel.findOne({
                user: userId,
                "products.productItemId": productId,
                "products.size": size
            });

            if (existingCartItem) {
                const currentQuantity = existingCartItem.products.find(item =>
                    item.productItemId.equals(productId) && item.size === size
                ).quantity;

                if (currentQuantity >= maxQuantityPerPerson) {
                    return reject(`Maximum quantity per person (${maxQuantityPerPerson}) reached for this product`);
                }
            }

            // Proceed with adding the product to the cart
            // Your existing logic for adding the product to the cart goes here
            // ...
            if(!existingCartItem) {
                            const cart = await cartModel.updateOne(
                                {
                                    user:userId,
                                },
                                {
                                    $push:{
                                        products: {
                                            productItemId:productId,
                                            quantity:1,
                                            size:size,
                                            price:product.price.salesPrice,
                                        }
                                    }
                                },
                                { upsert: true }
                
                            );
                
                            console.log(cart);
                            resolve(cart)
                        }else {
                            await cartModel.updateOne(
                                { user:userId,"products.productItemId":productId, "products.size":size },
                                { $inc: { "products.$.quantity":1 }}
                            );
                            const updatedCart = await cartModel.findOne({
                                user:userId,
                                "products.productItemId":productId,
                                "products.size":size
                            });
                            resolve(updatedCart)
                        }

            resolve(updatedCart);
        } catch (error) {
            console.log("Quantity exceeds maximum allowed per person");
            reject(error);
        }
    });
};


const isAProductInCart = (userId,productId)=> {
    return new Promise(async(resolve,reject)=> {
        try {
            console.log("> inside the cartHelper_isAProductIncart- function <"); //

            const cart = await cartModel.findOne({
                user: userId,
                "products.productItemId": productId,
            });

            console.log("cart...............xxxx.> ", cart);

            if(cart) {
                resolve(true)
            }else{
                resolve(false)
            }
        } catch (error) {
            console.log(error.message);
            reject(error)
        }
    })
}

const totalSubtotal = (userId, cartItems) => {
    
    return new Promise(async (resolve, reject) => {
        
      console.log("inside cathelper_totalsubtotal | userId>> "+userId);
      
      let cart = await cartModel.findOne({ user: userId });
      let total = 0;
      if (cart) {
            console.log("cart is nt EMPTY");
          if (cartItems.products.length) {
            for (let i = 0; i < cartItems.products.length; i++) {
              console.log(cartItems.products[i])
              total =total + cartItems.products[i].quantity *parseInt(cartItems.products[i].price);
            }
          } 
          cart.totalAmount = parseFloat(total);
          console.log(cart.totalAmount);
  
          await cart.save();
  
          resolve(total);
       
      } else {
        resolve(total);
      }
    });
  };


const 
getAllCartItems = (userId)=> {
    console.log("here is in getallcartitems >>");
    // console.log("userId is : > ",userId);
    return new Promise(async(res,rej)=> {
        try {
            
            let userCartItems = await cartModel.findOne({user: userId}).populate('products.productItemId').populate('user')
            // console.log("userCartItems is ",userCartItems);
            res(userCartItems)
        
        } catch (error) {
            rej(error)
        }
    })
}

const removeItemFromCart = (userId,productId) => {
    return new Promise(async(resolve,reject) => {

        cartModel.updateOne(
            { user: userId },
            {
                $pull:{ products: { productItemId: productId }}
            }
        ).then((result)=> {

            resolve(result)
        })
    })
}

const incDecProductQuantity = (userId,productId,quantity) => {
    return new Promise(async(resolve,reject) => {
        const cart = await cartModel.findOne({ user: userId });
        const product = cart.products.find((items) => {

            return items.productItemId.toString() == productId;
        })

        const productStock = await productModel.findOne({ _id: productId });
        console.log("> salesPrice :",productStock.price.salesPrice);
        
        let size = product.size;
        size = size.toLowerCase()
        console.log(size);     //M

        

        console.log("productStock>> ---- >>      "+productStock);
        console.log("productStock.size[size] ---- >>      "+productStock.size[size]);

        // const sizeStock = productStock.size.find((items) => {
        //     return items.size === size;
        //   });


        // Assuming `size` is a string indicating the size (e.g., "s", "m", "l")
        let sizeStock;

        console.log("..........productStock.size[size]?.quantity >>> ............"+productStock.size[size]?.quantity);
        console.log("> productStock.size[size] : ",productStock.size[size]);

        // Check if productStock is defined and has the size property
        if (productStock && productStock.size && productStock.size[size]) {
            sizeStock = productStock.size[size].quantity;
        } else {
            // Handle the case where the size is not found
            sizeStock = 0; // Or whatever default value you prefer
        }


        let newQuantity = product.quantity + parseInt(quantity)
        console.log("> newQuantity :",newQuantity);

        if( newQuantity < 1) {
            newQuantity = 1
        }

        console.log("newQuantity >>"+newQuantity);     //to findout
        console.log("sizeStock >>"+sizeStock);

        if(newQuantity > sizeStock) {
            resolve({ status:false, message:"stock limit exceeded" });

        }else {
            product.quantity = newQuantity;
            await cart.save();

            resolve({
                status:true,
                message:"quantity updated",
                price:productStock.productprice,
                individualprice:productStock.price.salesPrice,
                quantity:newQuantity
                //here we add the discount like    discount: productStock.productDiscount,

            })
        }

    });
};


const clearAllCartItems = ( userId ) => {
    return new Promise(async (resolve,reject) => {
        const result = await cartModel.deleteOne({ user: userId })
    })
}


const getCartCount = (userId) => {
    return new Promise(async(resolve,reject) => {
       
        let count = 0;
        let cart = await cartModel.findOne({ user: userId});

        if(cart) {
            count = cart.products.length;
        }else{
            count = 0;
        }

        resolve(count)
    })
}

module.exports = {
    addToCart,
    isAProductInCart,
    getAllCartItems,
    totalSubtotal,
    removeItemFromCart,
    incDecProductQuantity,
    clearAllCartItems,
    getCartCount
}