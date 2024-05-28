const User = require('../models/userSchema');
const productModel = require('../models/productModel');

const wishlistModel = require('../models/wishlistModel');

const wishlistHelper = require('../helper/wishlistHelper')
const cartHelper = require('../helper/cartHelper')


const wishlistload = async (req,res) => {
    try {
        console.log("> in the wishlistload function <");

        const userData = req.session.user;

        const cartCount = await cartHelper.getCartCount( userData );
        const wishlistCount = await wishlistHelper.getWishListCount( userData );
        const wishListItems = await wishlistHelper.getAllWishlistProducts( userData );

        // console.log("> wishListItems.product   :",wishListItems.product);
        console.log("> cartCount...........", cartCount);
        console.log("> wishlistCount........", wishlistCount);
        console.log("> wishListItems : ..........", wishListItems);

        console.log("wishListItems[0].product.name : >", wishListItems[0]);

        for (i = 0; i < wishListItems.length; i++){
            // wishListItems[i].product.offerPrice = Math.round(
            //   wishListItems[i].product.productprice -
            //     (wishListItems[i].product.productprice *
            //       wishListItems[i].product.productDiscount) /
            //       100
            // );
            const cartStatus = await cartHelper.isAProductInCart(userData, wishListItems[i].product._id);
            if (cartStatus) {
              console.log(true)
              wishListItems[i].cartStatus = cartStatus;
            }
            
        }
        

        res.render('wishlist', {
            userData: req.session.user,
            cartCount,
            wishlistCount,
            wishListItems

        })
        // res.send('wishlist pAGE')
        
    } catch (error) {
        console.log(error);
    }
}


const addToWishlist = async (req,res) => {
    try {
        console.log("> wishlistControl _ addTowishlist <");
        const userId = req.session.user;
        const productId = req.params.id;

        console.log("id of that product is : ", productId);

        const result = await wishlistHelper.addToWishlist(userId,productId);

        console.log("result is : ",result);

        if(!result.alreadyExists) {
            res.json({ status: true });
        }else {
            res.json({ status: false })
        }
    } catch (error) {
        console.log(error);
    }
}


const removeFromWishlist = async(req,res) => {
    try {

        console.log("req.body.productId .... >",req.body.productId);
        const userId = req.session.user;
        const result = await wishlistHelper.removeProductFromWishlist(userId,req.body.productId);

        if(result) {
            res.json({ status: true })
        }
        
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    wishlistload,
    addToWishlist,
    removeFromWishlist

}