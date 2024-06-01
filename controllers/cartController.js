const userModel = require('../models/userSchema')
const CartModel = require('../models/cartModel')
const ProductModel = require('../models/productModel')
const category = require('../models/categoryModel')

const cartHelper = require('../helper/cartHelper')
const cartModel = require('../models/cartModel')
const ObjectId=require('mongoose').Types.ObjectId


// cart 

const userCart = async(req,res)=> {
    try {

        console.log("here in usercart >>");
        const userData = req.session.user
        console.log("userData :>>>"+userData);
      
        const cartItems = await cartHelper.getAllCartItems(userData)
        
        // console.log("getting back with cartItems",cartItems)

        if(cartItems) {
            // console.log("cart items is",cartItems)
            // console.log("getting inside cart itmess====>");
            const email = req.session.user;
            if(cartItems.products.length>0) {
             
                // "getting inside cart itmem2"
                let totalandSubTotal = await cartHelper.totalSubtotal(userData,cartItems)
                console.log("get back with" ,totalandSubTotal);
                let totalAmountOfEachProduct = []
                for(let i =0; i< cartItems.products.length; i++) {
                   console.log(">>> gettting inside ..............................")
                    let total = 
                    cartItems.products[i].quantity * parseInt(cartItems.products[i].price)

                    

                    totalAmountOfEachProduct.push(total);
                    // console.log(total);
                }

                res.render('cart', 
                    
                    {
                        cartItems:cartItems,
                        totalAmount:totalandSubTotal,
                        totalAmountOfEachProduct,
                        status:true,
                        email

                    });
                    
                    
            }else {
                console.log(">its in cartItem else condition so render cart after this<");
                res.render('cart',
                {
                    status:false,
                })
            }
        }else{
            res.render('cart',{
                status:false
            })
        }
        
    } catch (error) {
        console.log(error);
        res
    }
}

const removeCartItem = async(req,res) => {
    try {
        
        const userId = req.session.user;
        const productId = req.params.id;

        const result = await cartHelper.removeItemFromCart(userId,productId)
        res.status(200).json({success:true})

    } catch (error) {
        console.log(error.message);
    }
}

const updateCartQuantity = async(req,res) => {

    console.log(">>cartcontrllr _ updateCartQuantity");
    
    const productId = req.query.productId;
    const quantity = req.query.quantity;
    const userId = req.session.user;

    console.log("productId>>>  "+productId+" quantity>>>  "+quantity+" userId>>>  "+userId);

    const product = await ProductModel.findOne({ _id:productId }).lean()
    const update = await cartHelper.incDecProductQuantity(
                        userId,
                        productId,
                        quantity,
                    )

    const cartItems = await cartHelper.getAllCartItems(userId);

    if(update.status) {
        const cart = await cartModel.aggregate([
            { $unwind:"$products"},
            {
                $match:{
                   user: new ObjectId(userId),
                   "products.productItemsId" : new ObjectId(productId)
                }}

        ]);


        const totalSubtotal = await cartHelper.totalSubtotal(userId,cartItems)
        console.log("in the cart controller_updatequnatity_totalSubtotal is >>...............  "+totalSubtotal);

        res.json({
            status: true,
            message: update.message,
            individualprice: update.individualprice,
            quantity:update.quantity,
            totalSubtotal,
        });
    }else {
        res.json({ status: false, message: update.message })
    }
}

module.exports = {
    userCart,
    removeCartItem,
    updateCartQuantity

}