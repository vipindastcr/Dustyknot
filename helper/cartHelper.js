const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const wishlistModel = require('../models/wishlistModel');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


const addToCart = (userId, productId, size) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await productModel.findOne({ _id: productId });
            const maxQuantityPerPerson = 3;
            const existingCartItem = await cartModel.findOne({
                user: userId,
                "products.productItemId": productId,
                "products.size": size
            });

            if (existingCartItem) {
                    const currentQuantity = existingCartItem.products.find(item =>
                    item.productItemId.equals(productId) && item.size === size).quantity;

                if (currentQuantity >= maxQuantityPerPerson) {
                    return reject(`Maximum quantity per person (${maxQuantityPerPerson}) reached for this product`);
                }
            }

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
            reject(error);
        }
    });
};


const isAProductInCart = (userId,productId)=> {
    return new Promise(async(resolve,reject)=> {
        
        try {
                const cart = await cartModel.findOne({
                user: userId,
                "products.productItemId": productId,
            });

            if(cart) {
                resolve(true)
            }else{
                resolve(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}


const totalSubtotal = (userId, cartItems) => {
    
    return new Promise(async (resolve, reject) => {
        
      let cart = await cartModel.findOne({ user: userId });
      let total = 0;
      if (cart) {
          if (cartItems.products.length) {
            for (let i = 0; i < cartItems.products.length; i++) {
              total =total + cartItems.products[i].quantity *parseInt(cartItems.products[i].price);
            }
          } 
          cart.totalAmount = parseFloat(total);
          await cart.save();
          resolve(total);
       
      } else {
        resolve(total);
      }
    });
  };


const 
getAllCartItems = (userId)=> {
    return new Promise(async(res,rej)=> {
        try {
            
            let userCartItems = await cartModel.findOne({user: userId}).populate('products.productItemId').populate('user')
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

        let size = product.size;
        size = size.toLowerCase()
        let sizeStock;

        if (productStock && productStock.size && productStock.size[size]) {
            sizeStock = productStock.size[size].quantity;
        } else {
            sizeStock = 0;
        }

        let newQuantity = product.quantity + parseInt(quantity)

        if( newQuantity < 1) {
            newQuantity = 1
        }

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