const {loginLoad} = require('../controllers/userController');
const productModel = require('../models/productModel');

const isLogin = (req,res,next) => {
    try {
        if(req.session.user) {
            res.redirect('/');
        }
        else{
            next();
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = (req,res,next) => {
    try {
        if (req.session.user) {
            next();
        }else {
           res.redirect('login');
        }

    } catch (error) {
        console.log(error);
    }
}


const LoadUserProduct = async(req,res) => {
    try {
        const id = req.params.id;
        const userData = req.session.user;
        const product = await productModel.findById({ id:id })
        .populate("category")
        .lean()
        console.log(product.image);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
    LoadUserProduct
}