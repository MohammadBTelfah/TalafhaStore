const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

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
        const photoUrl = profile.photos?.[0]?.value || '';

        let user = await User.findOne({ email });

        // ✅ لو المستخدم غير موجود
        if (!user) {
          const hashedPassword = await bcrypt.hash('GOOGLE_AUTH', 10);

          let savedFileName = '';
          if (photoUrl) {
            try {
              const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
              const buffer = Buffer.from(response.data, 'binary');
              const fileName = `${profile.id}.jpg`;

              const uploadPath = path.join(__dirname, '..', 'uploads', fileName);
              fs.writeFileSync(uploadPath, buffer);

              savedFileName = fileName;
            } catch (err) {
              console.error('❌ Failed to save Google profile image:', err.message);
            }
          }

          user = await User.create({
            username: profile.displayName?.toLowerCase().replace(/\s+/g, '') || 'googleuser',
            email,
            password: hashedPassword,
            phone: '0000000000',
            fullName: profile.displayName || 'Google User',
            role: 'user',
            profileImage: savedFileName,
            verified: true,
          });
        } else {
          // ✅ لو المستخدم موجود مسبقًا
          let updated = false;

          if ((!user.profileImage || user.profileImage === '') && photoUrl) {
            try {
              const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
              const buffer = Buffer.from(response.data, 'binary');
              const fileName = `${profile.id}.jpg`;

              const uploadPath = path.join(__dirname, '..', 'uploads', fileName);
              fs.writeFileSync(uploadPath, buffer);

              user.profileImage = fileName;
              updated = true;
            } catch (err) {
              console.error('❌ Failed to save Google profile image (existing user):', err.message);
            }
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

// ✅ جلسة المستخدم
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
