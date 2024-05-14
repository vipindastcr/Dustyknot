const nodemailer = require('nodemailer');

const generateOtp = require('../OtpController/generateOtp');

const sendOtpMail = function(email,Otp) {
    
    console.log('reached here?....w');
    console.log("123"+email)
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD,
        }
    })
    console.log('ivide ethikku');
const mailOptions = {
    from:process.env.EMAIL_USER,
    to: email,
    subject:'Dustyknot',
    text:`Hello your opt for sign in Dustyknot is ${Otp},Proceed with this otp`
}

transporter.sendMail(mailOptions,(error,info)=> {
    if(error) {
        console.log(error.message);
    }else{
        console.log("otp has sent to your mail");
        console.log(email);
        const otpExpiration = Date.now()+60*1000;
        req.session.otpExpiration = otpExpiration;
        res.status(200).json({message:"resend success"})
    }
})
}


module.exports = sendOtpMail;
