const couponModel = require('../models/couponModel');
const cartModel = require('../models/cartModel');


const couponHelper = require('../helper/couponHelper')

const adminCoupon = async(req,res) => {
    try {
        const page = req.query.page || 1;
        const startIndex = (page -1 ) * 6;
        const endIndex = page * 6;

        const productCount = await couponModel.find().count();
        
        const totalPage = Math.ceil(productCount/6);
        const coupons = await couponModel.find().skip(startIndex).limit(6);
        let allCoupons = await couponHelper.findAllCoupons();
        
        for( let i = 0; i < allCoupons.length; i++ ) {
            allCoupons[i].discount = (allCoupons[i].discount)
            
            allCoupons[i].expiryData = dateFormatter(allCoupons[i].expiryDate)
            
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
        
    } catch (error) {
        console.log(error);
    }
}


// Date Formatter
function dateFormatter(date) {
    
    return date.toISOString().slice(0, 10);
  }

const addCoupon = async (req,res) => {
    try {
    
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
        const result = await couponHelper.deleteSelectedCoupon(req.params.id);
        res.json({ message: "Coupon deleted" })
        
    } catch (error) {
        console.log(error);
    }
}



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



const applyCoupon = async(req,res) => {
    try {
        
        const price = parseInt(req.query.price);
        const userId =req.session.user;
        const couponCode = req.query.couponCode;
        
        if(price > 1500 ) {
            const result = await couponHelper.applyCoupon(userId,couponCode);
            
            if(result.status) {
                res.json({  result: result, status:true, message: "Coupon Applied Successfuly"  })
            }else {
                res.json({ result: result, status:false, message: "Coupon can only apply on 1500 and above" });
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


  const removeCoupon = async (req, res) => {
    try {

      const appliedCouponName = req.query.coupon;
      const userId = req.query.userId
      
      const coupon = await couponModel.findOne({code:appliedCouponName});
      const cart = await cartModel.findOne({user:userId})
      
      if (coupon) {
        cart.coupon = null;
        await cart.save();
        res.json({success:true})
      } else {  
        res.status(404).send('No active coupon found.'); 
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      res.status(500).send('Internal Server Error'); 
    }
  };

module.exports = {
    adminCoupon,
    addCoupon,
    deleteCoupon,
    editCoupon,
    applyCoupon,
    getEditCoupon,
    removeCoupon
}