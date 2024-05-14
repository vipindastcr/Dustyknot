const user = require("../models/userSchema")
const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")

const orderHelper = require("../helper/orderHelper")
const cartHelper = require("../helper/cartHelper")

const moment = require("moment")

const checkoutpage = async(req,res) => {
    try {
        console.log("orderController_in the checkout page");
        const userId = req.session.user
        const email = req.session.user
        const userData = await user.findById({ _id: userId })
        console.log("userData >>>>>> "+userData);
        const cartItems = await cartHelper.getAllCartItems( userId )
        let totalandsubtotal = await cartHelper.totalSubtotal( userId, cartItems )
        
       

        let totalAmountOfEachProduct = []
        for (let i = 0; i < cartItems.products.length; i++) {
            let total = 
                cartItems.products[i].quantity * parseInt( cartItems.products[i].price )

            console.log("quantity >> "+cartItems.products[i].quantity+" price >> "+cartItems.products[i].price);
            console.log("total >> "+total);

            totalAmountOfEachProduct.push(total);
        }

        console.log("totalandsubtotal >>................................................ "+totalandsubtotal);

        // res.send("order.....hi")
        res.render("userCheckout",{
                userData,
                cartItems,
                totalAmountOfEachProduct,
                totalandsubtotal,
                email
        })
        
        
    } catch (error) {
        console.log(error);
    }
}


const placeOrder = async(req,res) => {

    console.log("> ordrCntrllr_PlceOrder <");

    const userId = req.session.user;
    const {totalAmount,data} = req.body;

    const status = req.body.status;

    const result = await orderHelper.placeOrder(totalAmount,data, userId);
    if( result.status ) {
        console.log('........................................................its');
        const cart = await cartModel.deleteOne({ user: userId })
        console.log('the cart is',cart);
            console.log('ivida ethikkitoo');
            console.log(totalAmount+" "+"data >> "+data);
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

module.exports = {
    checkoutpage,
    placeOrder,
    orderSuccesspageload,
    orderDetails,
    cancelSingleOrder,
    orderspage,
    adminOrderDetails,
    changeOrderStatusOfEachProduct
}