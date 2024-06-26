const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3003/auth/google/callback'
}, (token, tokenSecret, profile, done) => {
  User.findOne({ googleId: profile.id }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
      });
      user.save((err) => {
        if (err) return done(err);
        return done(null, user);
      });
    } else {
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
