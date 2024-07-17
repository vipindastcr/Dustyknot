const express = require('express');


const generateOtp = function() {
    let Otp = "";

    for(let i=0; i<6; i++) {
        Otp += Math.floor(Math.random()*10)
    }
    
    return Otp;
}

module.exports = generateOtp;