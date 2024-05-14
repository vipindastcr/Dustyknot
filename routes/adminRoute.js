const express = require('express');
const adminRoute = express();
const path = require('path');

adminRoute.use(express.static('./public/adminassets'));
adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/Admin');

const multer = require('../middlewares/multer')
// const storage = multer.diskStorage({
//     destination:(req,file,cb) => {
//         cb(null,'uploads/');
//     },
//     filename:(req,file,cb) => {
//         cb(null,Date.now()+ '-' + file.originalname)
//     }
// })


const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const adminAuth = require('../middlewares/adminAuth')
const orderController = require('../controllers/orderController')
const imageMiddleware = require('../middlewares/imageValidateMiddleware')




// adminRoute.get('/adminReg',adminController.adminReg)
// adminRoute.post('/adminReg',adminController.postAdmin)

adminRoute.get('/adminLogin',adminAuth.isLogin,adminController.loadAdmin)
adminRoute.post('/adminLogin',adminController.postAdminLogin)
adminRoute.get('/adminDash',adminAuth.isLogout,adminController.getAdminDash)
adminRoute.get('/adminlogout',adminAuth.isLogout,adminController.logoutAdmin)

adminRoute.get('/userList',adminAuth.isLogout,adminController.displayUser)
adminRoute.post('/blockUserList',adminController.blockUser)


adminRoute.get('/categories',adminAuth.isLogout,categoryController.displayAddCategory)
adminRoute.post('/categories',categoryController.postAddCategories)
adminRoute.get('/editCategory',adminAuth.isLogout,categoryController.editCategory)
adminRoute.post('/editCategory',categoryController.postEditCategory)
adminRoute.post('/blockCategory',categoryController.blockCategory)
// adminRoute.put('/addcategory',adminAuth.isLogout,adminController.addcategory)
adminRoute.get('/addProduct',adminAuth.isLogout,productController.displayAddProduct)
adminRoute.post('/addProduct', adminAuth.isLogout, multer.productUpload.array("image"),imageMiddleware.validateImage, adminController.addProduct)

adminRoute.get('/productList',adminAuth.isLogout,productController.displayProductList)
adminRoute.get('/editProduct',adminAuth.isLogout,productController.editProduct)
adminRoute.post('/editProduct',multer.productUpload.array('image'),productController.postEditProduct)
adminRoute.delete('/deleteImage/:id',productController.deleteImage)     //nt wrkng
adminRoute.post('/blockProduct',productController.blockProduct)
adminRoute.get('/adminorderPage',adminAuth.isLogout,orderController.orderspage)
adminRoute.get('/adminOrderDetails/:id',adminAuth.isLogout,orderController.adminOrderDetails)

adminRoute.patch('/orderStatusChangeForEachProduct/:orderId/:productId',adminAuth.isLogout,orderController.changeOrderStatusOfEachProduct)

adminRoute.get('/userProductPage',)

// adminRoute.get('/unblockProduct',productController.unblockProduct)
// adminRoute.get('/blockUser',productController.blockUser)


module.exports = adminRoute;