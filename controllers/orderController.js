const user = require("../models/userSchema")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const couponModel = require("../models/couponModel")

const orderHelper = require("../helper/orderHelper")
const cartHelper = require("../helper/cartHelper")
const couponHelper = require('../helper/couponHelper')

const moment = require("moment")
const Razorpay = require('razorpay')


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



const checkoutpage = async(req,res) => {
    
  try {
        console.log("orderController_in the checkout page");
        const userId = req.session.user
        const email = req.session.user
        const userData = await user.findById({ _id: userId })

        
        console.log("userData >>>>>> "+userData);

        const coupons = await couponHelper.findAllCoupons();
        let cart = await cartModel.findOne({ user: userId })

        const cartItems = await cartHelper.getAllCartItems( userId )
        let totalandsubtotal = cart.totalAmount;
        

        if( cart.coupon != null ) {
            const appliedCoupon = await couponModel.findOne({ code: cart.coupon });
            cartItems.couponAmount = appliedCoupon.discount;

            console.log("cartItems.couponAmount : ", cartItems.couponAmount);

                let totalAmountOfEachProduct = []
            for (let i = 0; i < cartItems.products.length; i++) {
                let total = 
                    cartItems.products[i].quantity * parseInt( cartItems.products[i].price )

                console.log("quantity >> "+cartItems.products[i].quantity," price >> ",cartItems.products[i].price);
                console.log("total >> ",total);

                totalAmountOfEachProduct.push(total);
            }

            console.log("totalandsubtotal >>................................................ ",totalandsubtotal);

            if (cartItems) {
              console.log("totalAmountOfEachProduct 1: ",totalAmountOfEachProduct);
              console.log("cartItems s1sssssss", cartItems)
              res.render("userCheckout",{
                  userData,
                  cartItems,
                  totalAmountOfEachProduct,
                  totalandsubtotal,
                  email,
                  coupons
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
            console.log("cartItems s2-------", cartItems)
            console.log("totalAmountOfEachProduct 2: ",totalAmountOfEachProduct);
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

    console.log("> ordrCntrllr_PlceOrder <");

    const userId = req.session.user;
    const data = req.body;
    console.log(userId);
    const body = req.body;
    console.log("ordrcntrllr_plcordr > req.body is ....: ",data);

    // console.log("Place order failed");
    
    console.log("body.couponCode : > ", body.couponCode);
    let coupon = await cartModel.findOne({ code: body.couponCode });
    
    console.log("this is coupon : > ", coupon);

    const result = await orderHelper.placeOrder(data,userId);
    if( result.status ) {
        console.log('........................................................its');
        const cart = await cartModel.deleteOne({ user: userId })
        console.log('the cart is',cart);
            console.log('ivida ethikkitoo');
           
            console.log("userId  >> "+userId);
            res.json({ status: true })
        
    }else{
        res.json({status:false})
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
      // console.log("ordrdetails..........................>>................................:>>",orderDetails);
      const productDetails = await orderHelper.getOrderDetailsOfEachProduct(
        orderId
      );
      
      // console.log("this is product details",productDetails);
      console.log("objectId",);


  
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
      console.log("> ordercontrllr_orderspage <");
      const allOrders = await orderHelper.getAllOrders();
      
      console.log("all orders ; > "+allOrders); 
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
      console.log(productDetails);
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
      console.log("> entered to the orderController_create order <");
      const amount = parseInt(req.query.totalAmount);
      console.log(amount);
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: req.session.user
      })
      console.log(order);
      res.json({ orderId: order })
      
    } catch (error) {
        console.log(error);
    }
  }


  const ordersuccesspageload = (req,res) => {
    res.render('ordersuccesspage')
  }

  const paymentSuccess = (req,res) => {
    try {
      console.log("> inside the orderCOntroller_paymentSuccess <");
      console.log(req.body);

      const { paymentid, signature, orderId } = req.body;
      const { createHmac } = require("node:crypto");

      

      const hash = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentid)
        .digest("hex");

      if(hash === signature) {
        console.log("success");
        res.status(200).json({ success:true, message: "Payment successful" });
      }else {
        console.log("error");
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
    paymentSuccess
}