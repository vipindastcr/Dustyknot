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


// ////old logic
// const addProduct = async(req,res) => {
//     try {
//         console.log('youre getting here...!!');
//         const images = req.files;

//         const imageFile = images.map(image=>image.filename);

//         const {name,description,salesPrice,regularPrice,category,small,medium,large} = req.body;
//         console.log(category)
//         const product = new Product({
//             name:name,
//             description:description,
//             price:{
//                 salesPrice:salesPrice,
//                 regularPrice:regularPrice,
//             },
//             category:category,
//             image:imageFile,
//             size:{
//                 s:{
//                     quantity:small
//                 },
//                 m:{
//                     quantity:medium
//                 },
//                 l:{
//                     quantity:large
//                 }
//             }
//         })

//         // if(product.name ==)
//         const sproduct = await product.save();
//         res.redirect('/addProduct')
//     } catch (error) {
//         console.log(error.message);
//     }
// }


// // new logic
// const addProduct = async(req,res) => {
//     try {
//         console.log('youre getting here..>>addProduct page.!!');
//         const images = req.files;
//         const imageFile = images.map(image=>image.filename);
//         const {name,description,salesPrice,regularPrice,category,small,medium,large} = req.body;
//         name = req.body.name;
//         console.log(category);
//         console.log("sizes small medium large > "+small+medium+large);
//         console.log("productcontroler _ addProduct | what is the name here :>",name);

//         const existingProduct = await Product.findOne({ name: name})
//         console.log("existingProduct  >>"+existingProduct);

//         const product = new Product({
//             name:name,
//             description:description,
//             price:{
//                 salesPrice:salesPrice,
//                 regularPrice:regularPrice,
//             },
//             category:category,
//             image:imageFile,
//             size:{
//                 s:{
//                     quantity:small
//                 },
//                 m:{
//                     quantity:medium
//                 },
//                 l:{
//                     quantity:large
//                 }
//             }
//         })

//         // if(product.name ==)
//         const sproduct = await product.save();
//         res.redirect('/addProduct')
//     } catch (error) {
//         console.log(error.message);
//     }
// }



const blockProduct = async(req,res) => {
    try {
        console.log("entered to the blockprdct function ...");
        const id = req.body.id;
        console.log("blckPrdct id: "+id);
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
        console.log("editProduct_pid :>>>>>>>>>>>>>>>>>>>>>>>>>>>>", pid);
        req.session.pid = pid

        const product = await Product.findOne({_id:pid}).populate('category');

        console.log("product is >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+ product)
        const category = await Category.find({});
        console.log("> productController _ editProduct < CATEGORY>>: ",category);  //to check
        res.render('editProduct',{product,category});
    } catch (error) {
        console.log(error.message);
    }
}

const postEditProduct = async(req,res) => {
    try {
        const pid = req.session.pid;
        console.log("the pid is : "+pid);
        const images = req.files;
        console.log(images)
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

        console.log("product.category : > ",product.category);
        res.redirect('/productList')

    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req,res) => {
    try {
        console.log("> productController_ delete | <");
        const index = req.body.index;
        const pdtId = req.body.id;

        console.log("index is : "+index);
        console.log("productId is : "+pdtId);
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

        console.log("entered to the unblockprdct function ..."+req.query._id);
        const id = req.query._id;
        console.log("unblckPrdct id: "+id);
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

    console.log("reached here at addtoCart in prdctcntrlr || userId>> "+userId);

    const productId = req.params.id;
    const size = req.params.size;

    // console.log("productId > "+productId+"size > "+size);

    const result = await cartHelper.addToCart(userId, productId, size);
    if(result) {
        res.json({ status: true })
       
    }else {
        res.json({ status: false})
    }
}

module.exports = {
    displayAddProduct,
    // addProduct,
    displayProductList,
    blockProduct,
    unblockProduct,
    editProduct,
    postEditProduct,
    deleteImage,
    addToCart
}