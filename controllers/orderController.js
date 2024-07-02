const user = require("../models/userSchema")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const couponModel = require("../models/couponModel")
const orderHelper = require("../helper/orderHelper")
const cartHelper = require("../helper/cartHelper")
const couponHelper = require('../helper/couponHelper')
const moment = require("moment")
const Razorpay = require('razorpay')
const { url } = require("node:inspector")
const { error } = require("node:console")
const niceInvoice = require("nice-invoice");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const checkoutpage = async(req,res) => {
    
  try {
        const userId = req.session.user
        const email = req.session.user
        const userData = await user.findById({ _id: userId })
        const coupons = await couponHelper.findAllCoupons();
        let cart = await cartModel.findOne({ user: userId })
        const cartItems = await cartHelper.getAllCartItems( userId )
        let totalandsubtotal = cart.totalAmount;
        // let oldTotal = totalandsubtotal;
        
        console.log('cart>>>>.................||',cart);
        
        if( cart.coupon != null ) {
            const appliedCoupon = await couponModel.findOne({ code: cart.coupon });
            cartItems.couponAmount = appliedCoupon.discount;
            const couponAmt = cartItems.couponAmount
            console.log('couponAmount>>>>>...>>>>',couponAmt);
            

                let totalAmountOfEachProduct = []
            for (let i = 0; i < cartItems.products.length; i++) {
                let total = 
                    cartItems.products[i].quantity * parseInt( cartItems.products[i].price )

                totalAmountOfEachProduct.push(total);
            }

            if (cartItems) {
              
              res.render("userCheckout",{
                  userData,
                  cartItems,
                  totalAmountOfEachProduct,
                  totalandsubtotal,
                  email,
                  coupons,
                  cart,
                  // oldTotal
                  couponAmt
              })
          }
            
        }
         else {
          let totalAmountOfEachProduct = [];
          for ( i = 0; i< cartItems.products.length; i++ ) {
              let total = cartItems.products[i].quantity * parseInt(cartItems.products[i].price);
              totalAmountOfEachProduct.push(total)
              
          }
          totalandsubtotal = totalandsubtotal;

          if (cartItems) {
            
            res.render("userCheckout", {
              cartItems,
              totalAmountOfEachProduct,
              totalandsubtotal,
              userData,
              coupons,
            });
          }

        }

        
       
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async(req,res) => {

    const userId = req.session.user;
    const data = req.body;
    const body = req.body;
    let coupon = await couponModel.findOne({ code: body.couponCode });
    // const result = await orderHelper.placeOrder(data,userId);
    
    // if( result.status ) {

    //   if (coupon) {
    //     coupon.usedBy.push(userId);
    //     await coupon.save();
    //   }
        
    //     const cart = await cartModel.deleteOne({ user: userId })
    //     res.json({ status: true })
        
    // }else{
    //     res.json({status:false})
    // }

    console.log('the data is ',data);
    const cart = await cartModel.findOne({ user: userId })

    if (cart) {
         
      if (parseFloat(body.totalAmount) > 1000 && body.paymentOption === "COD") {
         
          return res.json({ message: "COD is not available for this price range", status: false });
      } else {
          const result = await orderHelper.placeOrder(body, userId, coupon);
        console.log('result',result);
          if (result.status) {
            if (coupon) {
                coupon.usedBy.push(userId);
                await coupon.save();
            }
          const result2 = await cartHelper.clearAllCartItems(userId);
          console.log('"result2 is "',result2);
          if(result2.success){
           res.json({ status: true });
          }

      }
  }
} else {
  console.log('payment failed');
 
  return res.json({ message: result.message, status: false });
}

}


const orderSuccesspageload = (req,res) => {
    res.render("ordersuccesspage")
}


const orderDetails = async (req, res) => {
    try {
      const orderId = req.params.id;
      const email = req.session.user;
      
      const userData = await user.findById({_id:req.session.user})
      const orderDetails = await orderHelper.getSingleOrderDetails(orderId);
      const productDetails = await orderHelper.getOrderDetailsOfEachProduct( orderId );
      
      console.log('productDetails<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< <<',productDetails);
  
      if (orderDetails && productDetails) {
        res.render("orderDetails", {
          userData,
          orderDetails,
          productDetails,
          email
        });
      }
    } catch (error) {
      console.log(error);
    }
  };


  const cancelSingleOrder = async(req,res) => {
    try {
      const orderId = req.query.orderId;
      const singleOrderId = req.query.singleOrderId;
      const price = req.query.price;

      const result = await orderHelper.cancelSingleOrder(orderId,singleOrderId,price);
      if (result) {
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const orderspage = async(req,res) => {
    try {
      const allOrders = await orderHelper.getAllOrders();
      for(const order of allOrders) {
        const dateString = order.orderedOn;
        const formattedData = moment(dateString).format("MMMM Do, YYYY");
        res.render("adminorderPage",{ allOrders })
      }
    } catch (error) {
      console.log(error);
    }
  }


  const adminOrderDetails = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const productDetails = await orderHelper.getOrderDetailsOfEachProduct(
        orderId
      );
      const userData = await user.findOne({ _id: productDetails[0].user });
      for (const product of productDetails) {
        const dateString = product.orderedOn;
        product.formattedDate = moment(dateString).format("MMMM Do, YYYY");
        product.formattedTotal = product.totalAmount;
        product.products.formattedProductPrice = product.products.productPrice;
      }
      
      if (orderDetails && productDetails) {
        res.render("adminOrderDetails", { orderDetails, productDetails, userData });
      }
      
    } catch (error) {
      console.log(error);
    }
  };


  const changeOrderStatusOfEachProduct = async (req, res) => {
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const status = req.body.status;
    const result = await orderHelper.changeOrderStatusOfEachProduct(
      orderId,
      productId,
      status,
    );
    if (result) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  };


  const createOrder = async(req,res) => {
    try {
      const amount = parseInt(req.query.totalAmount);
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: req.session.user
      })
      res.json({ orderId: order })
      
    } catch (error) {
        console.log(error);
    }
  }


  const ordersuccesspageload = (req,res) => {
    let email = req.session.userId
    res.render('ordersuccesspage',{email})
  }



  const paymentSuccess = (req,res) => {
    try {
      const { paymentid, signature, orderId } = req.body;
      const { createHmac } = require("node:crypto");

      
      const hash = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentid)
        .digest("hex");

      if(hash === signature) {
        res.status(200).json({ success:true, message: "Payment successful" });
      }else {
        res.json({ success:false, message: "Invalid payment details" });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  } 

  const orderFailurePageload = (req,res) => {
    res.render('orderFailure-page')
  }



  const SalesReportload = async(req,res) => {
    try {

        const page = req.query.page || 1;
        const startIndex = (page-1) * 6;
        const endIndex = page * 6;

        orderHelper.salesReport().then((response) => {

          response.forEach((order) => {
            const orderDate = new Date ( order.orderedOn );
            const formattedDate = orderDate.toLocaleDateString("en-GB",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            });
            order.orderedOn = formattedDate;
          });
          const productcount = response.length;
          const totalPage = Math.ceil( productcount/6 );
          response = response.slice(startIndex,endIndex);
          
          res.render('admin-salesReport', {sales: response, page, totalPage})
        })
        .catch((error) => {
            console.log(error);
        })
      
    } catch (error) {
      console.log(error);
    }
  }



  const SalesReportDateSortload = async(req,res) => {
    
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    

     orderHelper.salesReportDateSort(startDate,endDate).then((response)=>{
     res.status(200).json({sales:response})
     })
  }



module.exports = {
    checkoutpage,
    placeOrder,
    orderSuccesspageload,
    orderDetails,
    cancelSingleOrder,
    orderspage,
    adminOrderDetails,
    changeOrderStatusOfEachProduct,
    createOrder,
    ordersuccesspageload,
    orderFailurePageload,
    paymentSuccess,
    SalesReportload,
    SalesReportDateSortload
}