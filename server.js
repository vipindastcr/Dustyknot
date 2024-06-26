const express = require('express');
const app = express();
const PORT = 3003;
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser')
const nocache = require('nocache');
require('dotenv').config()
const passport = require('passport');


app.use(session({
    secret:"123abcba321",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:3600 * 1000,
    }
}))

app.use(passport.initialize());
app.use(passport.session());

const connectDB = require('./database/mongoose');
connectDB()

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(express.static('./'))
app.use('/uploads',express.static(path.join(__dirname,'uploads')));



const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const authRoute = require('./routes/authRoute');


app.use('/',nocache())
app.use(flash())

app.use('/',userRoute)
app.use('/',adminRoute)
app.use('/', authRoute);


app.listen(PORT,()=>console.log(`server is running ....on ${'http://localhost:3003/'}`))