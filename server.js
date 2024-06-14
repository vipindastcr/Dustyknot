const express = require('express');
const app = express();
const PORT = 3003;
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser')
const nocache = require('nocache');
require('dotenv').config()

// require('./auth')
// const User = require('./models/userSchema')


// const passport = require('./passport');
// const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

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
// passport.use(new GoogleStrategy({
//     clientID:     process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3003/auth/google/callback",
//     passReqToCallback   : true
//   },
// //   function(request, accessToken, refreshToken, profile, done) {
// //     done(null,profile)
// //   }
// async function(accessToken, refreshToken, profile, done) {
//     try {
//       // Find or create a user in your database
//       let user = await User.findOne({ googleId: profile.id });
//       if (!user) {
//         user = new User({
//           googleId: profile.id,
//           name: profile.displayName,
//           email: profile.emails[0].value,
//           // Store other profile information as needed
//         });
//         await user.save();
//       }
//       return done(null, user);
//     } catch (err) {
//     //   return done(err, null);
//     }
//   }
// ));

// passport.serializeUser((user,done)=>{
//     done(null,user)
// })

// passport.deserializeUser((user,done)=>{
//     done(null,user)
// })

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
const authRoute = require('./routes/authRoute');    // authentication route


app.use('/',nocache())
app.use(flash())

app.use('/',userRoute)
app.use('/',adminRoute)
app.use('/', authRoute); // Add authentication routes here


////oldone
// app.get('/auth/google',
//     passport.authenticate('google', { scope:
//         [ 'email', 'profile' ] }
//   ));
  
// //// Routes
// app.get('/auth/google',
//     passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
   
//   );
//   console.log("its here in auth /google succesS")

//   app.get( '/auth/google/callback',
//       passport.authenticate( 'google', {
//           successRedirect: '/auth/google/success',
//           failureRedirect: '/auth/google/failure'
//   }));

// app.get('/auth/google/callback', 
//     passport.authenticate('google', { failureRedirect: '/' }),
//     function(req, res) {

//         console.log("> auth-google-callback- failure happened<");
//       // Successful authentication, redirect home.
//       res.redirect('/');
//     }
//   );

//   app.get('/auth/google/success', (req, res) => {
//     res.send('Successfully authenticated');
//   });
  

//   app.get('/', (req, res) => {
//     res.send('Home Page');
//   });

app.listen(PORT,()=>console.log(`server is running ....on ${'http://localhost:3003/'}`))