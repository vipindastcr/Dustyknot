
const mongoose = require("mongoose");
function connectDb (){
    const mongo = mongoose.connect('mongodb://localhost:27017/dustyknotDB');
    mongo.then(()=> {
        console.log("Database connected");
    })
    .catch((error)=>{
        console.log("Database not conected something went wrong", error);
    })
}



module.exports = connectDb;