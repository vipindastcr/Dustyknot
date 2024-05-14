const express = require('express');
const userRoute = express();

userRoute.use(express.static('public'));


userRoute.set('view engine','ejs');
userRoute.set('views','./views/User')

const walletController = require('../controllers/walletController');
const userController = require('../controllers/userController');
const userMiddleware = require('../middlewares/userMiddleware');
const cartController = require('../controllers/cartController');
const productController = require('../controllers/productController');
const orderController = require("../controllers/orderController")


userRoute.get('/',userController.loadHome);
userRoute.get('/fashion',userMiddleware.isLogout,userController.loadFashion)  

userRoute.get('/login',userMiddleware.isLogin,userController.loadLogin);       
userRoute.post('/login',userMiddleware.isLogin,userController.checkUser); 
userRoute.get('/logout',userMiddleware.isLogout,userController.logOut);


userRoute.get('/register',userController.loadRegister)  
userRoute.post('/register',userController.userRegisterPost)
userRoute.get('/forgotPassword',userController.loadforgot)

userRoute.get('/userAccount',userMiddleware.isLogout,userController.loadAccount)
userRoute.get('/userProductPage/:id',userMiddleware.isLogout,userController.Loaduserproduct)

userRoute.get('/otp',userController.verifyOtp)
userRoute.post('/otp',userController.otpVerificationPost)
userRoute.post('/resendOTP',userController.resendOtp)

userRoute.get('/wallet',userMiddleware.isLogout,walletController.getWallet)
userRoute.get('/reviews',userMiddleware.isLogout,userController.getReview)
userRoute.post('/reviews',userController.postReview)

userRoute.get('/cart',userMiddleware.isLogout,cartController.userCart)
userRoute.post("/addToCart/:id/:size",userMiddleware.isLogout,productController.addToCart);
userRoute.delete("/removeCart/:id",cartController.removeCartItem)

userRoute.patch('/updateCartQuantity',cartController.updateCartQuantity)

userRoute.get("/checkout",userMiddleware.isLogout,orderController.checkoutpage)
userRoute.post('/placeOrder',orderController.placeOrder)
userRoute.get("/orderSuccessPage",userMiddleware.isLogout,orderController.orderSuccesspageload)
userRoute.get('/orderDetails/:id',userMiddleware.isLogout,orderController.orderDetails)
userRoute.patch("/addAddress",userController.addAddress)
userRoute.get('/addressEditor/:userId/:addressId',userController.addressEditModal)

userRoute.put('/updateUser',userController.updateUser)
userRoute.put('/editAddress/:id',userController.editAddress)
userRoute.put('/deleteAddress/:id',userController.deleteAddress)
userRoute.patch('/cancelSingleOrder',userMiddleware.isLogout,orderController.cancelSingleOrder)
userRoute.put('/updatePassword',userController.updatePassword)

module.exports = userRoute;