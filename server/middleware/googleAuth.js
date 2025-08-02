const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// ✅ Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5002/api/users/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const photo = profile.photos?.[0]?.value || '';

        let user = await User.findOne({ email });

        if (!user) {
          const hashedPassword = await bcrypt.hash('GOOGLE_AUTH', 10);

          user = await User.create({
            username: profile.displayName?.toLowerCase().replace(/\s+/g, '') || 'googleuser',
            email,
            password: hashedPassword,
            phone: '0000000000',
            fullName: profile.displayName || 'Google User',
            role: 'user',
            profileImage: photo,
            verified: true,
          });
        } else {
          let updated = false;

          if (!user.profileImage || user.profileImage === '') {
            user.profileImage = photo;
            updated = true;
          }

          if (!user.verified) {
            user.verified = true;
            updated = true;
          }

          if (updated) await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('🔥 Google Strategy Error:', error);
        return done(error, false);
      }
    }
  )
);

// ✅ إضافة serializeUser و deserializeUser لتجنب خطأ الجلسة
passport.serializeUser((user, done) => {
  done(null, user.id); // بنخزن فقط ID المستخدم في الجلسة
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // بنرجع المستخدم كامل
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
