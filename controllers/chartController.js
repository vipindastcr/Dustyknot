const { name } = require('ejs');
const Order = require('../models/orderModel')



const fetchsalesdata = async (req,res) => {
   
    try {
        console.log(">  chartcontroller_fetchsalesdata  <");


        const msg = req.body.msg;
        console.log("the msg is :",msg);
        console.log("req.body+++", req.body);
        if(msg) {

            const salesData = await Order.aggregate([
                {
                    $group: {
                        _id: { $month: "$createdAt"},/// group by month
                        totalAmount: { $sum: "$totalamount"}
                    },
                    

                },
                {
                    $project: {
                        month: "$_id", // project month as id
                        totalAmount: 1, // include totalAmount field
                        _id: 0// exclude '_id' field from the result
                    }
                }
            ]);

            

            console.log("after salesdata aggregaation");
            console.log(salesData);

            // Transform data into an array of total amounts
            const dataArray = Array.from({ length: 12},(_,i) => {

                const monthData = salesData.find(item => item.month === i+1) // find data for the month
                return monthData ? monthData.totalAmount : 0; // if data found, return totalAmount,otherwise return 0
            });

            const pieData = await Order.aggregate ([
                {
                    $unwind: "$products"  // unwind the products array
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $group: {
                        _id: "$category.name", // Group by category name
                        totalAmount: { $sum: "$totalamount"}  // Calculate total amount for each category
                    }
                }
            ])


            console.log("the pieData is >>> ",pieData);

            let arr1 = []
            let arr2 = []

            pieData.forEach(el => {
                
                name = el._id,
                arr1.push(name)
            })

            pieData.forEach(el2 => {

                totalamount = el2.totalAmount;
                arr2.push(totalamount)
            })

            console.log("both arrays are : >>>> ",arr1,arr2);


            console.log("sales data and arr1, arrr2 ",salesData,arr1,arr2);
            res.json({ salesData: dataArray, arr1: arr1, arr2: arr2})

        }
    } catch (error) {
        console.error("error fetching salesData:", error);
        res.status(500).json({ error:"internal server error"})
    }
}

module.exports = {
    fetchsalesdata
}