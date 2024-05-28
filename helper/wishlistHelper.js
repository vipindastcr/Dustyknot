const wishlistModel = require('../models/wishlistModel');
const productModel = require('../models/productModel');
const ObjectId = require("mongoose").Types.ObjectId; 

const addToWishlist = (userID,productId) => {
    return new Promise(async(resolve,reject)=> {
        console.log("> entered in the wishlistHelper addwishlist <");
        console.log(productId);

        const product = await productModel.findOne({_id: productId});

        console.log("here the product is : ",product);
        console.log("product.productstatus is : ",product.productstatus);

        if(!product || !product.productstatus) {
            console.log("product not found!");
            reject("product not found!");
            return;
        }

        console.log("userID :",userID," productId : ",productId);
        const existingWishlist = await wishlistModel.findOne({ user: userID, 'products.productItemId': productId });
        console.log("existingWishlist : ",existingWishlist);

        if(existingWishlist) {
            console.log(" > in the ifcondtn existingwishlist < ");
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
    console.log(" > inside wishlistController - getAllWishlistProducts  < ");
    
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

        console.log("> wishlisthelper < _wishlistProducts.......>>>>>>>>>>>>>>>>>>>>>>>>>>>> ",wishlistProducts);

        resolve(wishlistProducts)
    })
}

const removeProductFromWishlist = (userId,productId) => {
    return new Promise(async(resolve,reject) => {
        const removeItemss = await wishlistModel.findOne({
            user: new ObjectId(userId),
        })

        console.log("removing item - removeItemss: ",removeItemss);

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