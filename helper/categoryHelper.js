const categoryModel = require('../models/categoryModel');

const addCat = (productName,productDescription) => {
    try {
        return new Promise(async(resolve,reject) => {
            const checkCat = await categoryModel.findOne( { name: { $regex: new RegExp(productName, 'i')} });
            if(!checkCat) {
                const category = await categoryModel.updateOne( { name: {productName}},
                    {
                        $set: {
                                name: productName,
                                description: productDescription
                        }
                    },{ upsert: true }
                );
                resolve( { status: true, message: "Category added." });
            }else {
                resolve( { status: false, message: "Category already exists!" });
            }
        })
        
    } catch (error) {
        console.log(error);
    }

}


module.exports = {
    addCat
}