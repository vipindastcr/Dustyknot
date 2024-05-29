const couponModel = require('../models/couponModel');
const cartModel = require('../models/cartModel');


const couponHelper = require('../helper/couponHelper')

const adminCoupon = async(req,res) => {
    try {

        console.log("> here inside the couponcontroler_adminCoupon <");
        const page = req.query.page || 1;
        const startIndex = (page -1 ) * 6;
        const endIndex = page * 6;

        const productCount = await couponModel.find().count();
        console.log("> productCount is : ",productCount);

        const totalPage = Math.ceil(productCount/6);
        const coupons = await couponModel.find().skip(startIndex).limit(6);
        let allCoupons = await couponHelper.findAllCoupons();
        console.log("> allCoupons are : ",allCoupons);

        for( let i = 0; i < allCoupons.length; i++ ) {
            allCoupons[i].discount = (allCoupons[i].discount)
            
            allCoupons[i].expiryData = dateFormatter(allCoupons[i].expiryDate)
            // console.log("allCoupons[i].expiryData :",allCoupons[i].expiryData);
        }

        allCoupons = allCoupons.slice(startIndex,endIndex)
        const message = req.flash("message");

        if(message) {
            res.render('admin-coupon', {
                coupons: allCoupons, message: message, coupons, page, totalPage
            })
        }else{
            res.render('admin-coupon',{
                coupons: allCoupons
            })
        }
        // res.send("couponpage") //for testing purpose
    } catch (error) {
        console.log(error);
    }
}


// Date Formatter
function dateFormatter(date) {
    console.log("> inside the dateformatter <",date);
    // console.log("Received date:", date); //
    return date.toISOString().slice(0, 10);
  }
// function dateFormatter(date) {
//     return date.toISOString(); // Line 52    
// }

const addCoupon = async (req,res) => {
    try {
            console.log("> inside the couponController_ addCoupon <");
        
        if(req.body.couponDiscount > 1000) {
            req.flash('message', 'Max coupon amount exceeded')
            res.redirect('/admin-coupon')
        }else if(req.body.couponDiscount < 1) {
            req.flash("message", "Minimum Coupon Amount Not Met")
            res.redirect('/admin-coupon')
        }else {

            const coupon = await couponHelper.addCoupon(req.body)
            let allCoupons = await couponHelper.findAllCoupons();   
            console.log("> coupon is : ",allCoupons);
            res.render('admin-coupon',{coupons:allCoupons,page:'',totalPage:''})
        }
        
    } catch (error) {
        console.log(error);
    }
}


const deleteCoupon = async(req,res) => {
    try {
        console.log("> you are inside the couponController_deleteCoupon <");
        const result = await couponHelper.deleteSelectedCoupon(req.params.id);
        console.log("the result is : > ",result);
        res.json({ message: "Coupon deleted" })
        
    } catch (error) {
        console.log(error);
    }
}


// const editCoupon = async (req,res) => {
//     try {
//         console.log("> inside the editCoupon function <");
        
//         const couponId = req.params.id;
//         console.log(".....req.body. : ", req.body);

//         let editedCoupon = await couponHelper.editTheCouponDetails(req.body)
//         console.log("editedCoupon ............: ", editedCoupon);

//         // res.redirect('/admin-coupon')

        
//     } catch (error) {
//         console.log(error);
//     }
// }

const editCoupon = async (req, res) => {
    try {
        console.log("> in couponController_ editCoupon <");
        console.log("req.body ..................................................  :",req.body);

        let editedCoupon = await couponHelper.editTheCouponDetails(req.body);
        console.log("editedCoupon   >>>>:",editedCoupon);
  
        res.redirect("/admin-coupon",editedCoupon,{status:200});
    } catch (error) {
      console.log(error);
    }
  };

//   function dateFormatter(date) {
//     console.log("here, the Received date is :", date); 

//     console.log("what datatype : ",typeof date);
//     date.toISOString()
//     console.log(typeof date);
//     return date.toISOString().slice(0, 10);
//     let thedate = date.toISOString().split('T')[0]
//     console.log("thedate : >> ",thedate);
//   }


const applyCoupon = async(req,res) => {
    try {
        console.log(">  inside of coupon controller_ applyCoupon  <");

        const price = parseInt(req.query.price);
        const userId =req.session.user;
        const couponCode = req.query.couponCode;
        console.log("this is the coupon code : >> ",couponCode);
        if(price > 1500) {
            const result = await couponHelper.applyCoupon(userId,couponCode);
            console.log(result,"discount value");
            if(result.status) {
                res.json({  result: result, status:true, message: "Coupon Applied Successfuly"  })
            }else {
                res.json({ result: result, status:true, message: result.message });
            }
        }
        
    } catch (error) {
        console.log(error);
    }
}


const getEditCoupon = async (req, res) => {
    try {
      const couponData = await couponHelper.getCouponData(req.params.id);
  
      couponData.expiryDate = dateFormatter(couponData.expiryDate);
  
      res.json({ couponData });
    } catch (error) {
      console.log(error);
    }
  };

module.exports = {
    adminCoupon,
    addCoupon,
    deleteCoupon,
    editCoupon,
    applyCoupon,
    getEditCoupon
}