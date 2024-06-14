const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust path according to your User model

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3003/auth/google/callback'
}, (token, tokenSecret, profile, done) => {
  // Find or create user in your database
  User.findOne({ googleId: profile.id }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      // Create new user if not found
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        // Add any other relevant information from profile
      });
      user.save((err) => {
        if (err) return done(err);
        return done(null, user);
      });
    } else {
      // User found, return user
      return done(null, user);
    }
  });
}));



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});



module.exports = passport;
