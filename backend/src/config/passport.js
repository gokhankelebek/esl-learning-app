const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);
        console.log('Session auth type:', req.session.authType);
        
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        // For sign in
        if (req.session.authType === 'signin') {
          if (!user) {
            return done(null, false, { message: 'No user found with this email' });
          }
          return done(null, user);
        }
        
        // For sign up
        if (req.session.authType === 'signup') {
          if (user) {
            return done(null, false, { message: 'User already exists' });
          }
          
          user = new User({
            name: profile.displayName,
            email: email,
            password: 'google-oauth-' + Math.random().toString(36).slice(-8),
            level: 'beginner',
          });

          await user.save();
          return done(null, user);
        }

        // Default case (no auth type specified)
        if (user) {
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          email: email,
          password: 'google-oauth-' + Math.random().toString(36).slice(-8),
          level: 'beginner',
        });

        await user.save();
        done(null, user);
      } catch (err) {
        console.error('Google Strategy Error:', err);
        done(err, null);
      }
    }
  )
);

module.exports = passport;
