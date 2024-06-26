const wishlistModel = require('../models/wishlistModel');
const productModel = require('../models/productModel');
const ObjectId = require("mongoose").Types.ObjectId; 


const addToWishlist = (userID,productId) => {
    return new Promise(async(resolve,reject)=> {
        const product = await productModel.findOne({_id: productId});

        if(!product || !product.productstatus) {
            reject("product not found!");
            return;
        }

        const existingWishlist = await wishlistModel.findOne({ user: userID, 'products.productItemId': productId });

        if(existingWishlist) {
            resolve({ alreadyExists: true });
            return;
        }else {
            const wishlist = await wishlistModel.updateOne(
                {
                    user : userID,
                },
                {
                    $push: {
                        products: { productItemId: productId }
                    }
                },
                {
                    upsert: true,
                }

            );

            resolve(wishlist)
        }
    })
}


const getWishListCount = (userID) => {
    
    return new Promise(async(resolve,reject) => {

        let wishlist = await wishlistModel.findOne({ user: userID });
        let wishlistCount = wishlist?.products.length;
        
        resolve(wishlistCount);
    })
}


const getAllWishlistProducts = (userID) => {
    return new Promise (async(resolve,reject) => {
        let wishlistProducts = await wishlistModel.aggregate([
            {
                $match: {
                    user: new ObjectId(userID),
                }
            },
            {
                $unwind: "$products",
            },
            {
                $project: {
                    item: "$products.productItemId"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "item",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $project: {
                    item: 1,
                    product: {
                        $arrayElemAt: ["$product", 0],
                    }
                }
            }
        ]);

        resolve(wishlistProducts)
    })
}

const removeProductFromWishlist = (userId,productId) => {
    return new Promise(async(resolve,reject) => {
        const removeItemss = await wishlistModel.findOne({
            user: new ObjectId(userId),
        })

        await wishlistModel.updateOne(
            {
                user: new ObjectId(userId),
            },
            {
                $pull: {
                    products: {
                        productItemId: productId
                    }
                }
            }
        ).then((result) => {
            resolve(result)
        });
    });

};


module.exports = {
    addToWishlist,
    getWishListCount,
    getAllWishlistProducts,
    removeProductFromWishlist
}