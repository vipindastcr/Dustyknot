const express = require('express');
const passport = require('passport');
const router = express.Router();
require('dotenv').config()
// const passport = require('passport');

// Route to start OAuth process
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth callback route
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the home page or desired route
    res.redirect('/');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
