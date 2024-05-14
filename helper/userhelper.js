const { ObjectId } = require("mongodb")
const userModel = require("../models/userSchema")
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const { Promise } = require("mongoose");



// const getWalletDetails = (userId) => {
//     return new Promise (async(resolve,reject)=>{
//         const result = await userModel.findOne({ _id: userId })


//         if (result) {
//             resolve(result)
//         }else {
//             console.log("not found")
//         }
//     })
// }

const addAddressTouser = async (body, userId) => {
    try {
        const results = await userModel.updateOne(
            { _id:userId },
            {
                $push: { address:body }
            },
            { new:true },
        );
        console.log(results);
        return results;
        
    } catch (error) {
        throw error;
    }
}

// const updateUserDetails = (userId, userDetails) => {
  
//     return new Promise (async (resolve, reject) => {
//       const user = await userModel.findById(new ObjectId(userId));
  
//       let response = {};
//       if (user) {
//         if (user.isActive) {
//           const success = await bcrypt.compare(
  
//             userDetails.password,
//             user.password
//           );
//             console.log(success);
//           if (success) {
  
//             if (userDetails.name) {
//               user.name = userDetails.name;
//             }
//             if (userDetails.email) {
//               user.email = userDetails.email;
//             }
//             if (userDetails.mobile) {
//               user.mobile = userDetails.mobile;
//             }
           
//             await user.save();
//             response.status = true;
//             resolve(response);
//           } else {
//             response.message = "Incorrect Password";
//             resolve(response);
//           }
//         }
//       }
//     });
//   };

const updateUserDetails = async (userId, userDetails) => {
    try {
        const user = await userModel.findById(new ObjectId(userId));
        let response = {};

        if (user && user.isActive) {
            const success = await bcrypt.compare(userDetails.password, user.password);
            console.log(success);

            if (success) {
                if (userDetails.name) {
                    user.name = userDetails.name;
                }
                if (userDetails.email) {
                    user.email = userDetails.email;
                }
                if (userDetails.mobile) {
                    user.mobile = userDetails.mobile;
                }
                
                await user.save();
                response.status = true;
                return response;
            } else {
                response.message = "Incorrect Password";
                return response;
            }
        } else {
            response.message = "User not found or inactive";
            return response;
        }
    } catch (error) {
        console.error("Error updating user details:", error);
        throw error;
    }
};


const editAddress = async(userId,addressId,body) => {
    try {
        console.log("> you are here in userHelper _ editAddress <");
        console.log("areaname: > "+body.areaname);
        const result = await userModel.updateOne(
            {_id:new ObjectId(userId),'address._id':new ObjectId(addressId)},
            {$set:{'address.$':body}}
        )

        return result
        
    } catch (error) {
        console.log(error);
    }
}

const deleteAddressHelper = async(userId,addressId) => {
    try {
        console.log("> usrHelpr_deleteAddressHelper <");
        const result = await userModel.updateOne(
            {_id: userId},
            {$pull:{address:{_id:addressId}}}
        )

        console.log(result);
        if(result) {
            return result
        }
        
    } catch (error) {
        console.log(error);
    }
}



// const updateUserPassword = async (userId, passwordDetails) => {
//     return new Promise(async (resolve, reject) => {
//       const user = await userModel.findById(new ObjectId(userId));
      
//       console.log(passwordDetails);
//       let response = {};
//       if (user) {
//         if (user.isActive) {
//           if (typeof passwordDetails.oldPassword === 'string' && typeof user.password === 'string') {
//             const success = await bcrypt.compare(passwordDetails.oldPassword, user.password);
//             if (success) {
//               if (
//                 passwordDetails.newPassword &&
//                 passwordDetails.newPassword === passwordDetails.confirmPassword
//               ) {
//                 user.password = await bcrypt.hash(passwordDetails.newPassword, 10);
//                 await user.save();
//                 response.status = true;
//                 resolve(response);
//               }
//             } else {
//               response.message = "Incorrect Password";
//               resolve(response);
//             }
//           } else {
//             response.message = "Invalid input data format";
//             resolve(response);
//           }
//         }
//       }
//     });
//   };


const updateUserPassword = async (userId, passwordDetails) => {
    console.log("> userHelper_ updateUserPassword <");

    try {
        const user = await userModel.findById(new ObjectId(userId));

        console.log("userId is : " + userId);
        console.log("passwordDetails is : " + passwordDetails);
        let response = {};

        if (user) {
            if (user.isActive) {
                console.log("passwordDetails.oldPassword : " + passwordDetails.oldPassword);
                console.log("passwordDetails.newPassword : " + passwordDetails.newPassword);
                console.log("user.password : " + user.password);

                if (typeof passwordDetails.oldPassword === 'string' && typeof user.password === 'string') {
                    const success = await bcrypt.compare(passwordDetails.oldPassword, user.password);

                    if (success) {
                        if (passwordDetails.newPassword && passwordDetails.newPassword === passwordDetails.confirmPassword) {
                            user.password = await bcrypt.hash(passwordDetails.newPassword, 10);
                            await user.save();
                            response.status = true;
                            return response; // Return instead of resolve
                        } else {
                            response.message = "Passwords do not match!";
                        }
                    } else {
                        response.message = "Incorrect password!";
                    }
                } else {
                    response.message = "Invalid password entry. Please check.";
                }
            }
        }

        return response; // Return the response if the user is not found or not active
    } catch (error) {
        console.error("Error in updateUserPassword:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}


module.exports = {
    // getWalletDetails,
    addAddressTouser,
    updateUserDetails,
    editAddress,
    deleteAddressHelper,
    updateUserPassword
}