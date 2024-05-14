const isLogin = async (req,res,next) => {
    try {

        console.log("admin middleware adminauth: "+req.session.admn);
        if (req.session.admn) {
            res.redirect('/adminDash');
        }else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req,res,next) => {
    try {
        if(req.session.admn) {
            next();
        }else {
            res.redirect('/adminLogin')
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    isLogin,
    isLogout
}