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
      const email = profile.emails[0].value;
      const photo = profile.photos?.[0]?.value || ''; // ✅ الصورة من Google

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
          profileImage: photo,           // ✅ أضف الصورة
          verified: true,                // ✅ تفعيل تلقائي
        });
      } else {
        // ✅ تحديث الصورة والتفعيل إذا مش موجودين
        let updated = false;

        if (!user.profileImage || user.profileImage === '') {
          user.profileImage = photo;
          updated = true;
        }

        if (!user.verified) {
          user.verified = true;
          updated = true;
        }

        if (updated) await user.save(); // ✅ احفظ إذا صار تعديل
      }

      return done(null, user);
    } catch (error) {
      console.error('🔥 Google Strategy Error:', error);
      return done(error, false);
    }
  }
));

module.exports = passport;
