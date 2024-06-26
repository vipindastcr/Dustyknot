const categoryModel = require('../models/categoryModel');
const offerModel = require('../models/offerModel');


const getAllOffersOfProducts = () => {
    return new Promise(async(resolve,reject) => {
        try {

            const offers = await offerModel
                .find({ "productOffer.offerStatus": true })
                .populate("productOffer.product");

                for(const offer of offers) {
                    
                    offer.formattedStartingDate = formatDate( offer.startingDate.toString() );
                    offer.formattedEndingDate = formatDate( offer.endingDate.toString() );
                }

                if(offers) {
                    resolve(offers)
                }
            
        } catch (error) {
            console.log(error);
        }
    })
}


const productCreateOffer = (data) => {
        
        
    return new Promise(async(resolve,reject) => {
        try {
                const offer = await offerModel.create({
                    offerName: data.offerName,
                    startingDate: data.startDate,
                    endingDate: data.endDate,
                    "productOffer.product": data.productName,
                    "productOffer.discount":data.discountAmount,
                    "productOffer.offerStatus": true
                });
                
                resolve(offer)
            
        } catch (error) {
            console.log(error);
        }
    })
}


const createCategoryOffer = (data) => {
    return new Promise(async(resolve,reject) => {
        try {
            const result = await offerModel.create({
                offerName: data.offerName,
                startingDate: data.startDate,
                endingDate: data.endDate,
                'categoryOffer.category': data.categoryName,
                'categoryOffer.discount': data.offerDiscount,
                'categoryOffer.offerStatus': true
            });

            resolve(result)
            
            
        } catch (error) {
            console.log(error);
        }
    })
}




function formatDate( dateString ) {

    const date = new Date( dateString );
    const year = date.getFullYear();
    const month = String( date.getMonth()+1 ).padStart(2,"0");
    const day = String(date.getDate()).padStart(2,"0");

    return `${year}/${month}/${day}`;
}



module.exports = {

    getAllOffersOfProducts,
    productCreateOffer,
    createCategoryOffer
}