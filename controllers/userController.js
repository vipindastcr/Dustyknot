const User = require('../models/userSchema');
const Otp = require('../controllers/OtpController/generateOtp');
const sendOtpMail = require('../controllers/OtpController/otpUtils');
const bcrypt = require('bcrypt');
const NiceInvoice = require('nice-invoice');
const productModel = require('../models/productModel');
const offerModel = require('../models/offerModel')
const review = require('../models/reviewModel');
const Wallet = require('../models/walletSchema');
const moment = require("moment")
const userHelper=require("../helper/userhelper")
const orderHelper = require("../helper/orderHelper")
const categoryModel = require('../models/categoryModel');
const { query } = require('express');
const { name } = require('ejs');

// Function to hash the password
const securePasswordFunction = async(password) => {
    try{
        const passwordHash = await bcrypt.hash(password, 10)
            return passwordHash
    }catch(error){
        console.log(error.message)
    }
}

const loadHome = async (req,res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const email = req.session.user;
    const category = await categoryModel.find({ isActive:true })
    const sort = req.query.sort;


    // product offers--
    const productOffers = await offerModel.aggregate([
        {
            $project: {
                "productOffer.discount": 1
            },
            
        },
        {
            $sort: {
                "productOffer.discount": -1
            }
        }
        
    ])
    

    // category offers ---
    const categoryOffers = await offerModel.aggregate([
        {
            $project: {
                "categoryOffer.discount": 1
            }
        },
        {
            $sort: {
                "categoryOffer.discount": -1
            }
        }
    ])

    let bestOfferdiscount = 0;

    if( productOffers[0] > categoryOffers[0] ) {

        let bestOffer = productOffers[0];
        bestOfferdiscount = bestOffer.productOffer.discount;
    }else {
        bestOffer = categoryOffers[0];
        bestOfferdiscount = bestOffer.categoryOffer.discount;
    }

    try {  
        let product;
       const email = req.session.user   
        product = await productModel.find({isActive:true})
                        .skip((page - 1) * limit)
                        .limit(limit);
    let totalPages = Math.ceil(await productModel.countDocuments() / limit);
    let category = await categoryModel.find({isActive:true})


    if(req.query.name){
        req.session.filter_categor = req.query.name;
    }
    const searchword = req.query.search;
    let prdt = await productModel.find({isActive:true}).limit(1)

    res.render('home',{email,product,category,currentPage: page, totalPages,sort,bestOffer,bestOfferdiscount})
    } catch (error) {
        console.log(error);
    }
}



const loadLogin = async (req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req,res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}

const loadforgot = async(req,res) => {
    try {
        res.render("forgotPassword");
    } catch (error) {
        console.log(error.message);
    }
}

const userRegisterPost = async (req,res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.mobile;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        

        if(password !== confirmPassword) {
            return res.render('registration',{message:"password do not match"})
        }

        const userExist = await User.findOne({$or: [{phone:phone},{email:email}]});
        if( userExist!==null) {
        return res.render('registration',{message:"user already exists"})
        }
        
        const securePass = await securePasswordFunction(password);

        const userData = {
           name:name,
           email:email,
           mobile:phone,
           password:securePass
        }

        req.session.userData = userData;
        const generatedOtp = Otp();
        req.session.Otp = generatedOtp;
        req.session.timer = Date.now();
        
        sendOtpMail(email,generatedOtp);
        console.log(email,generatedOtp);
        
        const otpExpiration = Date.now() + 60*1000;
        req.session.otpExpiration = otpExpiration;
        req.session.userEmail = email;

        res.redirect('/otp');

        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({error:"internal server error"})
      }
}


const verifyOtp = async (req,res) => {
    try {
        const otpExpiration = req.session.otpExpiration;
        const email = req.session.userEmail;
        res.render('otp',{otpExpiration,email});

    } catch (error) {
        console.log(error.message);
      }
}




const createUser = async(userData) => {
    return await User.create(userData);
}

const otpVerificationPost = async (req,res) => {
    try {
        const currentTimer = Date.now();
        const timer = req.session.timer;
        
        if ( currentTimer-timer > 60000 ) {
            res.render('otp',{message:'OTP has been timeout'})
        }
        else{
            const storedOtp = req.session.Otp;
            const enteredOtp = req.body.otp;

            if(storedOtp == enteredOtp) {
                const userData = req.session.userData;
                const createdUser = await createUser(userData);
                
                if (createdUser) {
                    const wallet = {
                        user:createUser._id
                    }
                    const createdWallet = await createWallet(wallet)
                }

                res.redirect('/login');
            }else {
                const email = req.session.email
                const otpExpiration = req.session.otpExpiration
                res.render('otp',{ otpExpiration, email, message: "Incorrect OTP" })

            }
            
        }
        
    } catch (error) {
        console.log(error.message);
    }
}



let lastotpGeneration = 0;

const resendOtp = async (req,res) => {
    try {
        
        const currentTime = Date.now();
        const timeDifference = currentTime - lastotpGeneration/1000;
        console.log(timeDifference);

        if(timeDifference < 60) {
            res.send(400).json({message:"wait before resending"})
        }
        const generateOtp = Otp();
        const email = req.session.userEmail;
        const globalOtp = generateOtp;
        req.session.Otp = globalOtp;
        req.session.timer = Date.now();
        sendOtpMail(email,globalOtp);

        const otpExpiration = Date.now() + 60*1000;
        req.session.otpExpiration = otpExpiration;
        res.redirect('/views/User');

        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message:"Internal server error!!"});
    }
}

const checkUser = async(req,res) => {
    try {
        const logemail = req.body.email;
        const logpassword = req.body.password;
        const loggeduser = await User.findOne({ email:logemail })
       
        if(!loggeduser) {
            res.render('login',{notexists:"user not exists"})
        }

        if(loggeduser){
            if(loggeduser.isActive) {
                bcrypt.compare(logpassword, loggeduser.password)
                
                .then((response)=> {
                    
                    if(response) {

                        req.session.user = loggeduser._id

                    res.redirect('/');
                    }else {
                        res.render('login', { error1: "Incorrect password" });
                    }

                })
                .catch((error)=>{
                    console.log(error);
                })
            }
            else{
                res.render('login',{blocked:"user has been blocked"})
            }
        }
        else{
            
        }   
        


    } catch (error) {
        console.log(error.message);
    }
}

const logoutUser = async(req,res) => {
    try {
        if(req.session.user) {
            req.session.destroy();
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/')
    }
}


const loadAccount = async(req,res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId })
        const orderDetails = await orderHelper.getOrderDetails(userId);
        
        for(const order of orderDetails) {
            const dateString = order.orderedon;
            order.formattedDate = moment(dateString).format('MMMM Do YYYY');
            order.formattedTotal = order.totalAmount;
            
            let quantity = 0;
            for ( const product of order.products ) {
                quantity += Number(product.quantity)
            }

            order.quantity = quantity;
            quantity = 0

            
        
            
        }
        if(userId) {
        const email = req.session.user;
            res.render('userAccount',{userData,orderDetails,email})
        }
        else{
            res.render('userAccount')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const Loaduserproduct = async(req,res) => {
    try {
        const id = req.params.id;
        const email = req.session.user
        const userData = req.session.user;
        const product = await productModel
        .findById({_id:id})
        .populate("category")
        .lean()

        console.log(product.image);

            res.render('userProductPage',{product,userData,email})
            
    } catch (error) {
        console.log(error.message);
    }
}
const logOut = async(req,res)=>{
    if(req.session.user){
        req.session.user = null;
        res.redirect('/')
    }
}

const createWallet = async (wallet) => {
    try {
        return await Wallet.create(wallet)
    } catch (error) {
        console.log(error.message);
    }
}

const getReview = async (req,res) => {
    try {
        const review = await reviewSchema.findOne({_id:id});
        res.redirect('/userProductPage',{review})
    } catch (error) {
        console.log(error.message);
    }
}

const postReview = async (req,res) => {
    try {
        const {rating,comment,name,email,website} = req.body;
        const newReview = {rating,comment,name,email,website};
        const nReview = new review({
            
            name:name,
            email:email,
            website:website,
            comment:comment,
            rating:rating

        })

        const sReview = await nReview.save();
        res.redirect('/userProductPage/?_id');

    } catch (error) {
        console.log(error.message);
    }
}

const loadFashion = async (req,res) => {

    try {
        const email = req.session.user;
        const product = await productModel.find({isActive:true})
        res.render('fashion',{email,product})
        
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async (req,res) => {
    try {
        const body = req.body;
        const userId = req.session.user;
        const results = await userHelper.addAddressTouser(body, userId);

        if(results) {
            res.json({ success:true })
        }
        
    } catch (error) {
        console.log(error);
    }
}

const addressEditModal = async (req, res) => {
    try {
  
        const userId = req.params.userId;
        const addressId = req.params.addressId;
        const userData = await User.findById(userId);
    
      if (userData) {
        
        const addressData = userData.address.id(addressId);
        
        if (addressData) {
          res.json({ addressData });
        } else {
          res.status(404).json({ message: 'Address not found' });
        }
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


    
    const updateUser = async(req,res,next) => {
        try {
            const userId = req.session.user;
            const userDetails = req.body;
            const result = await userHelper.updateUserDetails(userId, userDetails)
            res.json(result)
            
        } catch (error) {
            console.log(error);
        }
    }

    const editAddress = async(req,res,next) => {
        try {
            const userId = req.session.user;
            const addressId = req.params.id;
            const body = req.body;
            const result = await userHelper.editAddress(userId, addressId, body)

           res.status(200).send({success:true})

            
        } catch (error) {
            console.log(error);
        }
    }

    const deleteAddress = async(req,res,next) => {
        try {
            const userId = req.session.user;
            const addressId = req.params.id;
            const result = await userHelper.deleteAddressHelper(userId,addressId);
            if (result) {
                res.json(result)
            }

        } catch (error) {
            console.log(error);
        }
    }



    const updatePassword = async(req,res) => {
        try {
            const userId = req.session.user;
            const passwordDetails = req.body;
            const result = await userHelper.updateUserPassword(userId,passwordDetails);
            res.json(result);    
        } catch (error) {
            console.log(error);
        }
    }


    const getShop = async (req, res) => {
        try {
            const page = req.query.page || 1
            const pdtcount = await productModel.find({ isActive: true }).count()
            const category = await categoryModel.find({isActive:true})
            const userID = req.session.user
            const user = await User.findOne({ _id: userID })
            const sort = req.query.sort
            
            if(sort == 'lowtohigh'){
                const product = await productModel.find({ isActive: true }).sort({'price.salesPrice': 1}).skip(pdtskip).limit(pageSize)
                res.render('Home', { user, product, userID,numofPage,category ,sort})
            }
            if(sort == 'hightolow'){
    
                const product = await productModel.find({ isActive: true }).sort({'price.salesPrice': -1}).skip(pdtskip).limit(pageSize)
                res.render('Home', { user, product, userID,numofPage,category,sort })
            }
            if(sort == 'aAzZ'){
                const product = await productModel.find({ isActive: true }).sort({name: 1}).skip(pdtskip).limit(pageSize)
                res.render('Home', { user, product, userID,numofPage,category,sort })
            }
            if(sort == 'zZaA'){
                const product = await productModel.find({ isActive: true }).sort({name: -1}).skip(pdtskip).limit(pageSize)
                res.render('Home', { user, product, userID,numofPage,category,sort })
            }
    
            const product = await productModel.find({ isActive: true }).skip(pdtskip).skip(pdtskip).limit(pageSize)
            res.render('Home', { user, product, userID,numofPage,category,sort })
        } catch (error) {
            console.log(error.message);
        }
    }

    const search = async(req,res) => {
        try {

            let searchword = "";

            if(req.query.q) {
                searchword = req.query.q;
            }

            const product = await productModel.find(
                    {name: { $regex: '.*'+searchword+'.*' } }
            )
            
        } catch (error) {
            console.log(error);
        }
    }


    const getCategory = async (req, res) => {
        try {

            const email = req.session.user;
            const category = await categoryModel.find({ isActive: true })
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            let totalPages = Math.ceil(await productModel.countDocuments() / limit);

            if(req.query.name){
                req.session.filter_categor = req.query.name;
            }
            const searchword = req.query.search;
        
            const sort = req.query.sort;
            if(req.session.filter_categor){
                let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                product = await productModel.find({ category:categoryTofilter._id,isActive:true })
            }
        
            if(sort == 'lowtohigh') {
                product = await productModel.find({ isActive:true }).sort({ 'price.salesPrice': 1 })
                if(req.session.filter_categor){
                    let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                    product = await productModel.find({ category:categoryTofilter._id,isActive:true }).sort({ 'price.salesPrice': 1 })
                }
            }
        
            if(sort == 'hightolow') {
                product = await productModel.find({ isActive:true }).sort({ 'price.salesPrice': -1 })
                if(req.session.filter_categor){
                    let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                    product = await productModel.find({ category:categoryTofilter._id,isActive:true }).sort({ 'price.salesPrice': -1 })
                }
            }
            if(sort == 'aAzZ') {
                product = await productModel.find({ isActive:true }).sort({ name: 1 })
                if(req.session.filter_categor){
                    let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                    product = await productModel.find({ category:categoryTofilter._id,isActive:true }).sort({ name: 1 })
                }
            }
            if(sort == 'zZaA') {
                product = await productModel.find({ isActive:true }).sort({ name: -1 })
                if(req.session.filter_categor){
                    let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                    product = await productModel.find({ category:categoryTofilter._id,isActive:true }).sort({ name: -1 })
                }
            }
        
        
            if(searchword){
                product = await productModel.find({name:{$regex: '.*'+ searchword +'.*',$options:"i"}})
                res.render('category',{email,product,category,currentPage: page, totalPages})    
            }else{
              res.render('category',{email,product,category,currentPage: page, totalPages})    
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    }

    
    const getEmail = async(req,res) => {

        const {email} = req.body;
        try {
            const user = await User.findOne({ email });
            if(!user) {
                return res.status(404).send("user not found")
            }else {
                req.session.userData = user;
                const generatedOtp = Otp();
                req.session.Otp = generatedOtp;
                req.session.timer = Date.now();

                const otpExpiration = Date.now() + 60*1000;
                req.session.otpExpiration = otpExpiration;
                req.session.userEmail = email;
                res.redirect('/otp2');    
            }
            
        } catch (error) {
            res.status(500).send({error:"internal server error"})
            }   
    }


 

    const loadOtp2 = async(req,res) => {
        const otpExpiration = req.session.otpExpiration;
        const email = req.session.userEmail;
        res.render('otp2',{otpExpiration,email});
    }


    const postOtp2 = async(req,res) => {
        try {
                const currentTimer = Date.now();
                const timer = req.session.timer;

                if( currentTimer-timer > 60000 ) {
                    res.render('otp',{message:'OTP has been timeout'})
                }
                else {
                      const storedOtp = req.session.Otp;
                      const enteredOtp = req.body.otp;

                        if(storedOtp == enteredOtp) {
                            const userData = req.session.userData;
                            
                            res.render('enterNewPass')
                        }
                }

            
        } catch (error) {
            res.status(500).send("Internal error in postOtp2")
        }
    }
      


    const resetPass = async(req,res) => {
        try {
            const newPassord = req.body.password;
            const securePass = await securePasswordFunction(newPassord)
            const session = req.session.userData
            const user = await User.findOne({email: session.email})

            if(user) {
                await User.findOneAndUpdate({ email: user.email }, { $set: { password: securePass } })
                res.redirect('/login')
            }
            
        } catch (error) {
            res.status(500).send("Internal error in forgot/resetpass")
        }
    }


    const tokenSignin = async(req,res) => {
        try {
            const token = req.body.id_token;
            verify(token).then((ticket)=> {
                const payload = ticket.getPayload()
                const userId = payload['sub']

                res.send('user signed in', userId)
            }).catch(err => {
                res.status(400).send('Token verification failed');
            })
            
        } catch (error) {
            console.log(error);
            res.status(500).send("internal server error")
        }
    }

module.exports = {
    loadHome,
    loadLogin,
    loadRegister,
    logoutUser,
    userRegisterPost,
    verifyOtp,
    otpVerificationPost,
    resendOtp,
    checkUser,
    loadAccount,
    Loaduserproduct,
    logOut,
    loadforgot,
    createWallet,
    getReview,
    postReview,
    loadFashion,
    addAddress,
    updateUser,
    addressEditModal,
    editAddress,
    deleteAddress,
    updatePassword,
    getShop,
    getCategory,
    getEmail,
    loadOtp2,
    postOtp2,
    resetPass,
    tokenSignin
    // generateInvoice,
    // invoiceDownload
}