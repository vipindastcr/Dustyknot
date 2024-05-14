
const Admin = require('../models/adminSchema');
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const categoryHelper = require('../helper/categoryHelper');
const productHelper = require('../helper/productHelper')
// const { addProduct } = require('./productController');


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
        res.render('adminDash')
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

        console.log("adminData full: >>"+adminData);

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
    addProduct
}