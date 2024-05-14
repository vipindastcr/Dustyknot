// const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/dustyknotDB");

// mongoose.connection.on('connected',()=> {
//     console.log("connected to mongodb");
// })

// mongoose.connection.on('error',(err)=> {
//     console.log("failed to connect mongodb");
// })

// mongoose.connection.on('disconnected',()=> {
//     console.log("disconnected from mongodd");
// })


// module.exports = mongoose;
//-----------
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