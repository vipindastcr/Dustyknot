const express = require('express');


const generateOtp = function() {
    let Otp = "";
    console.log("gettting otp");

    for(let i=0; i<6; i++) {
        Otp += Math.floor(Math.random()*10)
    }
    
    console.log("evide ethiyi000..???"+Otp);
    return Otp;
}

module.exports = generateOtp;