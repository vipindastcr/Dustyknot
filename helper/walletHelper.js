const userModel = require('../models/userSchema');

const walletAmountAdding = async(userId,subTotal) => {
    console.log('the amount is adding to wallet');

    try {

        const user = await userModel.findById(userId);
        console.log('user: ', user);
        console.log('subtotal :', subTotal);

        const currentBalance = user.wallet.balance;
        const amount = parseInt(subTotal);
        const newBalance = currentBalance + amount;

        const newDetail = {
            type: "refund",
            amount: amount,
            date: new Date(),
            transactionId: Math.floor(100000 + Math.random() * 900000)
        };

        const response = await userModel.findOneAndUpdate(
            {_id: userId },
            {
                $set: {'wallet.balance': newBalance },
                $push: { 'wallet.details': newDetail }
            },
            { new: true }
        );

        return response;
        
    } catch (error) {
        console.error('error updating wallet amount ',error);
        throw error;
    }
}


// const getWalletDetails = async (userId) => {
//   return new Promise(async (resolve, reject) => {
//     const result = await userModel
//             .findOne({ _id: userId })
//             // .sort({ 'wallet.details': -1 });

//             console.log('thE result is :', result);

//     if (result) {
//       resolve(result);
//     } else {
//       console.log("not found");
//     }
//   });
// };

module.exports = {
    walletAmountAdding,
    // getWalletDetails
};