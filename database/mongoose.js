
const mongoose = require("mongoose");
function connectDb (){
    // const mongo = mongoose.connect('mongodb://localhost:27017/dustyknotDB');
    const mongo = mongoose.connect('mongodb+srv://vipindasDustyknot:12345678AsD@cluster0.5tl42z0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    mongo.then(()=> {
        console.log("Database connected");
    })
    .catch((error)=>{
        console.log("Database not conected something went wrong", error);
    })
}



module.exports = connectDb;