const User = require('../models/userSchema')


const userBlock = async (req,res,next) => {
    try {
        
        if(req.session.user) {
            const userId = req.session.user;
            const user = await User.findById(userId)
            if(user) {
                if(user.isActive === false) {
                    req.session.destroy();
                    return res.redirect("/login");
                }
            }
        }
        next();
        
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"})
    }
}

module.exports = {
    userBlock
}