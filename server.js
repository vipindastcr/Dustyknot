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
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


app.use(session({
    secret:"123abcba321",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:3600 * 1000,
    }
}))

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3003/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    done(null,profile)
  }
));

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

const connectDB = require('./database/mongoose');
connectDB()


// app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(express.static('./'))
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
// app.set('view engine','ejs');
// app.set("views",'./views')


const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');


app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));





app.use('/',nocache())
app.use(flash())

app.use('/',userRoute)
app.use('/',adminRoute)


app.listen(PORT,()=>console.log("server is running ...."))