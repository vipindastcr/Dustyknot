const offerModel = require("../models/offerModel");
const productHelper = require('../helper/productHelper')
const offerHelper = require('../helper/offerHelper');
const productModel = require("../models/productModel");
const categoryHelper = require("../helper/categoryHelper");

const productofferLoad = async(req,res) => {

    try {
            const page = req.query.page || 1;
            const startIndex = (page-1)*6;
            const endINdex = page * 6;

            const productCount = await offerModel.find().count();
            const totalPage = Math.ceil(productCount/6);
            const offer = await offerModel.find().count();

            let offers = await offerHelper.getAllOffersOfProducts();
            const products = await productHelper.getAllProducts();
            const message = req.flash("message");

            offers = offers.slice(startIndex,endINdex)


            if(message.length > 0) {
                console.log(message);
                res.render('admin-productoffer',{ offers,products,message,page,totalPage,offer })
            }else {
                res.render('admin-productoffer',{ offers, products,page,totalPage,offer })
            }

    } catch (error) {
        console.log(error);
    }
    
}

const productAddOffer = async(req,res) => {
    try {
        const dat = req.body;
        const offer = await offerHelper.productCreateOffer(req.body)
        
    } catch (error) {
        console.log(error);
    }
}


const categoryofferLoad = async(req,res) => {
    try {
        const page = req.query.page || 1;
        const startIndex = (page-1) * 6;
        const endIndex = page*6;

        const productcount = await offerModel.find({ 'categoryOffer.offerStatus': true }).count();
        const totalPage = Math.ceil(productcount/6);

        const offer = await offerModel.find({'categoryOffer.offerStatus': true }).skip(startIndex).limit(6);
        let offers = await offerModel.find({ 'categoryOffer.offerStatus': true })

        const categories = await categoryHelper.getAllActiveCategory();
        const message = req.flash("message");
        
        

        if(message.length > 0) {
            console.log(message);
            res.render('admin-categoryoffer',{offers,categories,message,page,totalPage,offer})
        }else {
            res.render('admin-categoryoffer',{ offers, categories,page,totalPage,offer })
        }
        
    } catch (error) {
        console.log(error);
    }
}


const addCategoryOffer = async(req,res) => {
    try {
        const offer =await offerHelper.createCategoryOffer(req.body);

        if(offer) {
            req.flash("message","Offer Added");
            res.redirect('/admin-categoryoffer')
        }
        
    } catch (error) {
        console.log(error);
    }
}


module.exports = {

    productofferLoad,
    productAddOffer,
    categoryofferLoad,
    addCategoryOffer
}