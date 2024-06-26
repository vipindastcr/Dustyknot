const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const cartModel = require('../models/cartModel')
const cartHelper = require('../helper/cartHelper')
const fs = require('fs');
const path = require('path');
const productModel = require('../models/productModel');


const displayAddProduct = async (req,res) => {
    try {
        const categories = await Category.find({isActive:true});
        res.render('addProduct',{categories});

    } catch (error) {
        console.log(error.message);
    }
}

const displayProductList = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;

    try {
        const products = await Product.find({})
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(await Product.countDocuments() / limit);

        res.render('productList', { products, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const blockProduct = async(req,res) => {
    try {
        const id = req.body.id;
        const product = await Product.findById({_id:id});
        if(product.isActive == true) {
            await Product.findOneAndUpdate({_id:id},{$set: {isActive:false}});
        }else {
            await Product.findOneAndUpdate({_id:id},{$set: {isActive:true}})
        }

        res.json({success:true})
        
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async(req,res) => {
    try {
        const pid = req.query._id
        req.session.pid = pid

        const product = await Product.findOne({_id:pid}).populate('category');
        const category = await Category.find({});
        res.render('editProduct',{product,category});
    } catch (error) {
        console.log(error.message);
    }
}

const postEditProduct = async(req,res) => {
    try {
        const pid = req.session.pid;
        const images = req.files;
        const imageFile = await images.map(image => image.filename)
        const {name,description,salesPrice,category,small,medium,large} = req.body

        if( images.length>0) {
            await Product.findByIdAndUpdate({_id:pid},{$push: {image:{$each:imageFile}}})
        }

        const product = await Product.findOneAndUpdate({_id:pid},{$set: {
            name:name,
            description:description,
            price:{
                salesPrice:salesPrice
            },
            category:category,
            size:{
                s:{
                    quantity:small,
                },
                m:{
                    quantity:medium,
                },
                l:{
                    quantity:large,
                }
            }
        }})

        res.redirect('/productList')

    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req,res) => {
    try {
        const index = req.body.index;
        const pdtId = req.body.id;
        const product = await Product.findById({_id:pdtId})

        const deletePDTimage = product.image[index]

        fs.unlink(deletePDTimage,(err) =>{
            if(err) {
                console.log(err.message);
            }else{
                console.log("set");
            }
        })

            product.image.splice(index,1)
            await product.save()
            res.status(200).json({success:true})

    } catch (error) {
        console.log(error.message);
    }
}


const unblockProduct = async (req,res) =>{
    try {

        const id = req.query._id;
        const product = await Product.findById({_id:id});
        if(product.isActive == false) {
            await Product.findOneAndUpdate({_id:id},{$set: {isActive:true}});
        }else {
            await Product.findOneAndUpdate({Id:id},{$set: {isActive:false}})
        }

        res.redirect('/productList')
        
    } catch (error) {
        console.log(error.message);
    }
}

//addtocart
const addToCart = async (req,res)=> {
    const userId = req.session.user;
    const productId = req.params.id;
    const size = req.params.size;
    const result = await cartHelper.addToCart(userId, productId, size);
    
    if(result) {
        res.json({ status: true })
       
    }else {
        res.json({ status: false})
    }
}

module.exports = {
    displayAddProduct,
    displayProductList,
    blockProduct,
    unblockProduct,
    editProduct,
    postEditProduct,
    deleteImage,
    addToCart
}