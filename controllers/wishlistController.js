const User = require('../models/userSchema');
const productModel = require('../models/productModel');

const wishlistModel = require('../models/wishlistModel');

const wishlistHelper = require('../helper/wishlistHelper')
const cartHelper = require('../helper/cartHelper')
const mongoose = require('mongoose')


const wishlistload = async (req,res) => {
    try {
        const userData = req.session.user;
        const email = req.session.user;
        const cartCount = await cartHelper.getCartCount( userData );
        const wishlistCount = await wishlistHelper.getWishListCount( userData );
        const wishListItems = await wishlistHelper.getAllWishlistProducts( userData );

        res.render('wishlist', {
            userData: req.session.user,
            cartCount,
            wishlistCount,
            wishListItems,
            email

        })
        
    } catch (error) {
        console.log(error);
    }
}


const addToWishlist = async (req,res) => {
    try {
        const userId = req.session.user;
        const productId = req.params.id;
        const result = await wishlistHelper.addToWishlist(userId,productId);

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