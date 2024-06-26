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
const orderController = require("../controllers/orderController");
const userBlockingMiddileware = require('../middlewares/userBlockingMiddleare');
const wishlistController = require('../controllers/wishlistController');
const couponController = require('../controllers/couponController')




userRoute.get('/',userController.loadHome);
userRoute.get('/fashion',userController.loadFashion)  
userRoute.get('/login',userMiddleware.isLogin,userController.loadLogin);       
userRoute.post('/login',userMiddleware.isLogin,userController.checkUser); 
userRoute.get('/logout',userMiddleware.isLogout,userController.logOut);
userRoute.get('/register',userController.loadRegister)  
userRoute.post('/register',userController.userRegisterPost)
userRoute.get('/forgotPassword',userController.loadforgot)
userRoute.post('/forgotPassword',userController.getEmail)
userRoute.get('/otp2',userController.loadOtp2)
userRoute.post('/otp2',userController.postOtp2)
userRoute.post('/enterNewPass',userController.resetPass)
userRoute.get('/userAccount',userMiddleware.isLogout,userBlockingMiddileware.userBlock,userController.loadAccount)
userRoute.get('/userProductPage/:id',userController.Loaduserproduct)
userRoute.get('/otp',userController.verifyOtp)
userRoute.post('/otp',userController.otpVerificationPost)
userRoute.post('/resendOTP',userController.resendOtp)
userRoute.get('/wallet',userMiddleware.isLogout,walletController.getWallet)
userRoute.get('/reviews',userMiddleware.isLogout,userController.getReview)
userRoute.post('/reviews',userController.postReview)
userRoute.get('/cart',userMiddleware.isLogout,userBlockingMiddileware.userBlock,cartController.userCart)
userRoute.post("/addToCart/:id/:size",userMiddleware.isLogout,userBlockingMiddileware.userBlock,productController.addToCart);
userRoute.delete("/removeCart/:id",userBlockingMiddileware.userBlock,cartController.removeCartItem)
userRoute.patch('/updateCartQuantity',userBlockingMiddileware.userBlock,cartController.updateCartQuantity)
userRoute.get("/checkout",userMiddleware.isLogout,userBlockingMiddileware.userBlock,orderController.checkoutpage)
userRoute.post('/placeOrder',userBlockingMiddileware.userBlock,orderController.placeOrder)
userRoute.get("/orderSuccessPage",userMiddleware.isLogout,userBlockingMiddileware.userBlock,orderController.orderSuccesspageload)
userRoute.get('/orderDetails/:id',userMiddleware.isLogout,userBlockingMiddileware.userBlock,orderController.orderDetails)
userRoute.patch("/addAddress",userBlockingMiddileware.userBlock,userController.addAddress)
userRoute.get('/addressEditor/:userId/:addressId',userBlockingMiddileware.userBlock,userController.addressEditModal)
userRoute.put('/updateUser',userBlockingMiddileware.userBlock,userController.updateUser)
userRoute.put('/editAddress/:id',userBlockingMiddileware.userBlock,userController.editAddress)
userRoute.put('/deleteAddress/:id',userBlockingMiddileware.userBlock,userController.deleteAddress)
userRoute.patch('/cancelSingleOrder',userMiddleware.isLogout,userBlockingMiddileware.userBlock,orderController.cancelSingleOrder)
userRoute.put('/updatePassword',userBlockingMiddileware.userBlock,userController.updatePassword)
userRoute.get('/category',userController.getCategory)
userRoute.get('/wishlist',userMiddleware.isLogout,userBlockingMiddileware.userBlock,wishlistController.wishlistload)
userRoute.post('/addToWishlist/:id',userMiddleware.isLogout,wishlistController.addToWishlist)
userRoute.put('/removeFromWishList',userMiddleware.isLogout,wishlistController.removeFromWishlist)
userRoute.post('/createorder',userMiddleware.isLogout,orderController.createOrder)
userRoute.get('/ordersuccesspage',userMiddleware.isLogout,orderController.ordersuccesspageload)
userRoute.get('/orderFailure-page',userMiddleware.isLogout,orderController.orderFailurePageload)
userRoute.post('/paymentSuccess',userMiddleware.isLogout,orderController.paymentSuccess)
userRoute.post('/applyCoupon',userMiddleware.isLogout,couponController.applyCoupon)
userRoute.post('/removeCoupon',userMiddleware.isLogout,couponController.removeCoupon)
// userRoute.post('/generate-invoice',userController.invoiceDownload)



module.exports = userRoute;