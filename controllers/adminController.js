
const Admin = require('../models/adminSchema');
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const categoryHelper = require('../helper/categoryHelper');
const productHelper = require('../helper/productHelper')
// const { addProduct } = require('./productController');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');


const adminReg = async (req,res,next) =>{
    try {
        res.render('adminReg')
    } catch (error) {
        console.log(error.message);
    }
}

const loadAdmin = async (req,res) => {
    try {
        res.render('adminLogin')
    } catch (error) {
        console.log(error.message);
    }
}

const getAdminDash = async(req,res) => {
    try {

        console.log("> inside the getadminDash <");

        const salesDetails = await orderModel.find();
        let totalRevenue =0;
        
        
            for(let i=0;i<salesDetails.length;i++){
                totalRevenue+=salesDetails[i].totalAmount
            }
            console.log(totalRevenue);
        const products = await productModel.find();
        const categories = await categoryModel.find();

        // const topSellingProducts = await orderModel.aggregate([      // for top selling products display after chart
        //     { $unwind: "$products" },
        //     {
        //       $group: {
        //         _id: "$products.product",
        //         totalQuantity: { $sum: "$products.quantity" },
        //       },
        //     }, 
        //     { $sort: { totalQuantity: -1 } }, 
        //     { $limit: 10 }, 
        // ]);



        res.render('adminDash',{totalRevenue})
    } catch (error) {
        console.log(error.message);
    }
}

const displayUser = async(req,res)=> {       
    try {
        const user = await User.find({})
        console.log(user);
        res.render('userList',{user});
    } catch (error) {
        console.log(error.message);
    }
}


const postAdminLogin = async(req,res) => {
    try {
        
        const email = req.body.lemail;
        const password = req.body.lpass;

        console.log(email+"  postadminlogin "+password);
        const adminData = await Admin.findOne({
            email:email
        }).catch(error=>console.error("mongoose findOne error",error))

        // console.log("adminData full: >>"+adminData);

        if(adminData) {

            if( adminData.password == password) {
                req.session.admn = adminData._id;
                res.redirect('/adminDash');
            }else{
                res.render('adminLogin',{incorrectpass:"incorrect password"})
            }
        }
        else{
            res.render('adminLogin',{incorrect:"incorrect email or password"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const postAdmin =async (req,res) => {
    try {
        // console.log("req body: "+req.body);
        const { name,email,mobile,password,confirmPassword } = req.body;
        // name = req.body.name;
        // console.log(req.body.name);

        const hashed = await bcrypt.hash(password,10);

        const adm = {
            name,
            email,
            mobile,
            password:hashed,
            // confirmPassword
        }

        console.log("adm: "+adm);

        const admn = new Admin({name,email,mobile,password,isActive:1})
        await admn.save();

        res.status(201).json({message: "admin created succesfully",admn})
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:"server error"})
    }
}


const logoutAdmin = async (req,res) => {
    try {
        console.log("req.session.admn: "+req.session.admn);
        if( req.session.admn ) {
            req.session.destroy((error) => {
                if(error) {
                    res.redirect('/userList')
                }else {
                    res.redirect('/adminLogin')
                }
            })
        }else {
            res.redirect('/adminLogin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req,res) => {
    try {
        
        console.log("enter to the block user page");
        const userId = req.body.id;
        console.log("userId :"+userId);
        const findUser = await User.findById({ _id:userId });
        if(findUser.isActive === true) {
            await User.findByIdAndUpdate({ _id:userId },{ $set:{ isActive:false } })
        }else{
            await User.findByIdAndUpdate({ _id:userId },{ $set: { isActive:true }})
        }

        res.json({ success:true });
        // res.redirect('/userList')

    } catch (error) {
        console.log(error.message);
    }
}

const addcategory = async(req,res) => {
    const userId = req.session.user;
    const { productName,productDescription } = req.body;

    const result = await categoryHelper.addCat(productName,productDescription);

}

const addProduct=(req,res)=>{
    console.log("> you are inside the addProduct <");
    console.log("inside admncontrllr _ addprdct | req.body is: vvvv");
    console.log(req.body)
    const body = req.body
    const files=req.files
  
    console.log("req.files...................................................................................",files);
    
    productHelper.addProduct(body,files)
    .then((response)=>{
      console.log("hello",response);
      res.redirect('/addProduct')
    })
    .catch((error)=>{
      console.log(error);
    })
}



const showChart = async(req,res) => {
    try {

        console.log("> in admincontroller_showchart <");
        

            const monthlySalesData = await orderModel.aggregate([
                {
                    $match: { "products.status": "delivered"}
                },
                {
                    $group: {
                        _id: { $month: "$orderedOn"},
                        totalAmount : { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);


            console.log("monthlySalesData  :>>",monthlySalesData);


            const dailySalesData = await orderModel.aggregate([
                {
                    $match: { "products.status" : "delivered" }
                },
                {
                    $group: {
                        _id: { $dayOfMonth : "$orderedOn"},
                        totalAmount: { $sum: "$totalAmount"}
                    }
                },
                {
                    $sort: { _id: 1}
                }
            ]);

            console.log("daily sales data : >", dailySalesData);

            const orderStatuses = await orderModel.aggregate([
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products.status",
                        count: { $sum : 1 }
                    }
                }
            ]);

            console.log("order statues : >> ", orderStatuses);


            const eachOrderStatusCount = {};
            orderStatuses.forEach((status) => {
                
                eachOrderStatusCount[status._id] = status.count;
            });


            res
                .status(200)
                .json({monthlySalesData, dailySalesData, eachOrderStatusCount})


        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal server error"})
    }
}

module.exports = {
    adminReg,
    postAdmin,
    loadAdmin,
    getAdminDash,
    displayUser,
    postAdminLogin,
    logoutAdmin,
    blockUser,
    addcategory,
    addProduct,
    showChart
}