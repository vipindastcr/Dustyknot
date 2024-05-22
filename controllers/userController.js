const User = require('../models/userSchema');

const Otp = require('../controllers/OtpController/generateOtp');
const sendOtpMail = require('../controllers/OtpController/otpUtils');
const bcrypt = require('bcrypt');
const productModel = require('../models/productModel');
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

    // console.log("userController_loadHOme || categoryname : ",categoryname);
    
    // console.log("sort ....>",sort);
    res.render('home',{email,product,category,currentPage: page, totalPages,sort})
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
        console.log("getting inside a post user");
        // const fullname = req.body.fullname;
        
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.mobile;
        const password = req.body.password;

        console.log(email+"  "+password);
        // console.log("phone number : "+req.body.mobile);

        // Retrieve confirmpassword from the request body
        const confirmPassword = req.body.confirmPassword;
        

        // Check if the password and confirmpassword matches
        if(password !== confirmPassword) {
            return res.render('registration',{message:"password do not match"})
        }

         // check the user already exists
        const userExist = await User.findOne({$or: [{phone:phone},{email:email}]});
        console.log("user exist is "+userExist)
        if( userExist!==null) {
        return res.render('registration',{message:"user already exists"})
        }

        console.log("user does not exists");

        //hash password security
        const securePass = await securePasswordFunction(password);

        //create new userdata object
        const userData = {
           name:name,
           email:email,
           mobile:phone,
           password:securePass
        }

        //store userdata in the session for otp verification
        req.session.userData = userData;
        console.log(userData);
        console.log("ivide ningaL ethiyo");

        //generate otp and timer save it for temporary
        const generatedOtp = Otp();
        req.session.Otp = generatedOtp;
        req.session.timer = Date.now();
        console.log("Generated OTP:",generatedOtp);


        //send otp to mail
        sendOtpMail(email,generatedOtp);
        console.log(email,generatedOtp);
        //set otp expiration time
        const otpExpiration = Date.now() + 60*1000;
        req.session.otpExpiration = otpExpiration;
        req.session.userEmail = email;

        // redirect to otp verification page
        res.redirect('/otp');

        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({error:"internal server error"})
      }
}


const verifyOtp = async (req,res) => {
    try {
        const otpExpiration = req.session.otpExpiration;
        // console.log("otp_exprtn"+otpExpiration);
        const email = req.session.userEmail;
        console.log("sssn_exp"+email);
        res.render('otp',{otpExpiration,email});

    } catch (error) {
        console.log(error.message);
      }
}


const createUser = async(userData) => {
    return await User.create(userData);
}

const otpVerificationPost = async (req,res) => {
    console.log("ivide ethiYOOO..");
    try {
        const currentTimer = Date.now();
        const timer = req.session.timer;
        
        if ( currentTimer-timer > 60000 ) {
            console.log("OTP timeout");
            res.render('otp',{message:'OTP has been timeout'})
        }
        else{
            const storedOtp = req.session.Otp;
            const enteredOtp = req.body.otp;

            console.log("storedOtp: ",req.session.Otp);
            console.log("enteredOtp: ",req.body.otp);

            if(storedOtp == enteredOtp) {
                const userData = req.session.userData;
                const createdUser = await createUser(userData);
                
                if (createdUser) {
                    console.log("yess!!!!!! wallet creating");
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
        console.log("gets here");
        const currentTime = Date.now();
        const timeDifference = currentTime - lastotpGeneration/1000;
        console.log(timeDifference);

        if(timeDifference < 60) {
            res.send(400).json({message:"wait before resending"})
        }
        const generateOtp = Otp();
        const email = req.session.userEmail;
        console.log(email);
        const globalOtp = generateOtp;
        req.session.Otp = globalOtp;
        req.session.timer = Date.now();
        console.log(email,globalOtp);
        console.log("ivide unde");
        sendOtpMail(email,globalOtp);

        const otpExpiration = Date.now() + 60*1000;
        req.session.otpExpiration = otpExpiration;
        console.log("ho, ivide ethi");
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

        console.log("> userController_ checkUser ||  logemail >> "+logemail+" logpass >> "+logpassword);
    
        const loggeduser = await User.findOne({ email:logemail })
       
        if(!loggeduser) {
            res.render('login',{notexists:"user not exists"})
        }
        // console.log(logpassword+"<<<<logpassword  loggeduser.password >>>>--->>"+ loggeduser.password);

        if(loggeduser){
            if(loggeduser.isActive) {
                bcrypt.compare(logpassword, loggeduser.password)
                
                .then((response)=> {
                    
                    if(response) {

                        req.session.user = loggeduser._id

                    res.redirect('/');
                    console.log("userController_checkuser | redirect to home >> ");

                    }else {
                        // Password doesn't match
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
            // res.render('login',{notexists:"user not exists"})
        }   
        


    } catch (error) {
        console.log(error.message);
    }
}

const logoutUser = async(req,res) => {
    try {
        if(req.session.user) {
            // req.session.destroy((error) => {
            //     if (error) {
            //             console.log("error destroying the session", error);
            //     }
            //     res.redirect('/')
            // })
            req.session.destroy();
            res.redirect('/')
        }
    } catch (error) {
        console.log("error logging out user: ",error);
        res.redirect('/')
    }
}


const loadAccount = async(req,res) => {
    try {
        const userId = req.session.user;
        
        console.log(">> usercontroller_loadAccount <<| userId >> "+userId);
        const userData = await User.findOne({ _id: userId })
        // const WalletData = await userHelper.getWalletDetails(userId);
        // console.log("usrCntrlr_loadAccount | userData ................>>"+userData);

        
        // console.log(users)

        const orderDetails = await orderHelper.getOrderDetails(userId);
        // console.log("ordrDetlszz .........>"+orderDetails);
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
        console.log("the id is",id);
        const userData = req.session.user;
        const product = await productModel
        .findById({_id:id})
        .populate("category")
        .lean()

        console.log(product.image);

            res.render('userProductPage',{product,userData,email})
            
            // res.send('userProductPage')

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
        console.log("getting into wallet");
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
        console.log("here we are in post review");
        const {rating,comment,name,email,website} = req.body;
        const newReview = {rating,comment,name,email,website};
        console.log(newReview);

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
    
    // console.log('the product is ',product);
      res.render('fashion',{email,product})
        
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async (req,res) => {
    try {

        console.log("inside the add address user_userController");
        const body = req.body;

        console.log("the body is >>..........>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.... "+body);

        const userId = req.session.user;
        const results = await userHelper.addAddressTouser(body, userId);
        console.log(results);

        if(results) {
            console.log(results);
            res.json({ success:true })
        }
        
    } catch (error) {
        console.log(error);
    }
}

const addressEditModal = async (req, res) => {
    try {

        console.log("userControllr_addressEditModal");
      const userId = req.params.userId;
      const addressId = req.params.addressId;
  
      // Assuming you have a User model
      const userData = await User.findById(userId);
      console.log(userId)
      if (userData) {
        
        const addressData = userData.address.id(addressId);
        
        if (addressData) {
          console.log("addressdata : > "+addressData);
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


//cart

// const getCart = async(req,res)=>{
//     try {

//         const userID = req.session.user;
//         const ucart = await Cart.findOne({user:userID}).populate('Items.productId')
//         console.log("ucart : "+ucart);
        
//         if(ucart == null) {
//             res.render('cart',{userID})
//         }else{
//             res.render('cart',{ucart,userID})
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

    
    const updateUser = async(req,res,next) => {
        try {
            console.log("inside userController_update user...................................................<<");
            const userId = req.session.user;
            console.log("userID  >> ................................................................"+userId);
            const userDetails = req.body;
            console.log("userDetails >>> "+ userDetails);
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

            console.log("> inside userCntrllr_editAddress <");
            console.log("addressId : > "+addressId+" body : > "+body);
            const result = await userHelper.editAddress(userId, addressId, body)

           res.status(200).send({success:true})

            
        } catch (error) {
            console.log(error);
        }
    }

    const deleteAddress = async(req,res,next) => {
        try {
            console.log("> inside usrcntrllr_deleteAddress <");
            const userId = req.session.user;
            console.log("userId : > "+userId);
            const addressId = req.params.id;
            console.log("addressId : > "+addressId);
            const result = await userHelper.deleteAddressHelper(userId,addressId);
            if (result) {
                console.log(result);
                res.json(result)
            }

        } catch (error) {
            console.log(error);
        }
    }



    const updatePassword = async(req,res) => {
        try {

            console.log(">inside usercontroller_updatepassword <");
            
            const userId = req.session.user;
            const passwordDetails = req.body;

            console.log("passwordDetails "+passwordDetails);

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
            console.log('the category',category);
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
                console.log('earch fctn..........................',searchword);
            }
            

            const product = await productModel.find(
                
                {name: { $regex: '.*'+searchword+'.*' } }
            )

            console.log("prdct>>>>",product);

            // res.render('Home',product)


            
        } catch (error) {
            console.log(error);
        }
    }

// work on this getCat -
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
            console.log("sort ....>",sort);
            if(req.session.filter_categor){
                console.log('hi..............................');
                let categoryTofilter = await categoryModel.findOne({name:req.session.filter_categor,isActive:true})
                product = await productModel.find({ category:categoryTofilter._id,isActive:true })
                console.log(product);
                console.log(categoryTofilter._id);
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
                console.log(searchword);
                console.log("in search ..");
        
                product = await productModel.find({name:{$regex: '.*'+ searchword +'.*',$options:"i"}})
               
              res.render('category',{email,product,category,currentPage: page, totalPages})    
            }else{
              res.render('category',{email,product,category,currentPage: page, totalPages})    
        
            }
            // res.render('category',{email,product,category,currentPage: page, totalPages,sort})
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
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
    

}