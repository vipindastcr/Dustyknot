const couponModel = require('../models/couponModel');
const cartModel = require('../models/cartModel');
const voucherCode = require('voucher-code-generator')

const orderModel = require('../models/orderModel')

const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');


const addCoupon = (couponData) => {

    console.log("> inside of couponHelper _ addCoupon <");

    return new Promise(async (resolve,reject) => {
        const dateString = couponData.couponExpiry;

        const date = moment(dateString, 'YYYY-MM-DD');
        const convertedDate = date.toISOString();

        let couponCode = voucherCode.generate({
            length: 6,
            count: 1,
            charset: voucherCode.charset("alphabetic"),
        });

        console.log("> couponCode : ",couponCode);

        const coupon = new couponModel({
            couponName: couponData.couponName,
            code: couponCode[0],
            discount: couponData.couponDiscount,
            expiryDate: convertedDate,
        })
        

        await coupon
            .save()
            .then(() => {
                resolve(coupon._id)
            })

            .catch((error) => {
                reject(error)
            })

    })
}

const findAllCoupons = () => {
    return new Promise(async (resolve,reject) => {

        await couponModel
            .find().lean()
            .then((result) => {
                resolve(result)
            })
    })
}

const deleteSelectedCoupon = (couponId) => {
    console.log("> in the couponHelper_deleteselectedCoupon <");
    return new Promise(async (resolve,reject) => {
        let result = await couponModel.findOneAndDelete({ _id: couponId });
        resolve(result)
    })
}


const editTheCouponDetails = async (editedCouponData) => {
    try {

        console.log("> you are in the couponHelper_ editthecouponDetails <");
        console.log("editedCouponData : ",editedCouponData);
        console.log("> couponHelper_ editTheCoupondetails  couponId: <", editedCouponData.couponId1);

        let coupon = await couponModel.findById(editedCouponData.couponId1)

        console.log("the coupon ",coupon);
        console.log(editedCouponData.couponName1);

        coupon.couponName = editedCouponData.couponName1;
      coupon.discount = editedCouponData.couponDiscount1; // Corrected property name
      coupon.expiryDate = editedCouponData.couponExpiry1;

      console.log("check here ..........",coupon.couponName,"....",coupon.discount,".....",coupon.expiryDate);
  
      await coupon.save();
      return coupon;

        
    } catch (error) {
        throw(error)
    }
}

const applyCoupon = (userId,couponCode) => {
    return new Promise (async(resolve,reject) => {
        console.log(">> couponHelper_applyCoupon <<");
        let coupon = await couponModel.findOne({ code: couponCode})

        console.log("the coupon is : >",coupon);
        
        if(coupon && coupon.isActive === 'Active') {


            if(!coupon.usedBy.includes(userId)) {

                console.log(" it works only when it is not used by the userId---------------------------------------");
                console.log(coupon.usedBy.includes(userId));


                let cart = await cartModel.findOne({ user: new ObjectId(userId)})
                console.log(cart);
                const discount = coupon.discount / 100 ;
                console.log("> the discount is :  <", discount);
                console.log("cart.totalAmount : ",cart.totalAmount);

                // discount substraction
                cart.totalAmount = cart.totalAmount - cart.totalAmount*discount;
                cart.coupon = couponCode;
                
                await cart.save();
                console.log("amount after the coupon applied is : > ",cart.totalAmount);

                coupon.usedBy.push({ userId: userId });
                await coupon.save();
                
                console.log(cart);

                resolve({
                    discount,
                    cart,
                    status: true,
                    message: "Coupon applied successfully",
                })

            }else {
                console.log("if the coupon already ",!coupon.usedBy.includes(uesrId));
                resolve({ status: false, message: "This coupon is already used" })
            }
        }else {
            resolve({ status: false, message: "Invalid Coupon code" });
        }
    })
}



const getCouponData = (couponId) => {
    return new Promise(async(resolve,reject) => {
        await couponModel
            .findOne({ _id: couponId })
            .lean()
            .then((result)=> {
                resolve(result)
            });
    });
}




module.exports = {
    addCoupon,
    findAllCoupons,
    deleteSelectedCoupon,
    editTheCouponDetails,
    applyCoupon,
    getCouponData,
    

}