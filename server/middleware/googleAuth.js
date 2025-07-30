const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// ✅ Google Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5002/api/users/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // تحقق إذا المستخدم موجود
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // ✅ إنشاء كلمة مرور مشفرة
        const hashedPassword = await bcrypt.hash('GOOGLE_AUTH', 10);

        // ✅ إنشاء مستخدم جديد
        user = await User.create({
          username: profile.displayName || 'Google User',
          email: profile.emails[0].value,
          password: hashedPassword, // ✅ تم التشفير
          phone: '0000000000',
          fullName: profile.displayName || 'Google User',
          role: 'user',
          isActive: true
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('🔥 Google Strategy Error:', error);
      return done(error, false);
    }
  }
));

// ✅ Passport session handling
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

module.exports = passport;
