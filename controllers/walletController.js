
const Wallet = require('../models/walletSchema');
const User = require("../models/userSchema");

const getWallet = async(req,res) => {
    try {
      
        const userID = req.session.user;
  
        const wallet = await Wallet.findOne({user:userID})
         res.render('wallet',{userID,wallet})
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    getWallet,
}