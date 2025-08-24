const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// 👇 خليه يقرأ من env: على المحلي = http://localhost:5002
// على Render = https://talafhastore.onrender.com (تحطها في Settings → Environment)
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:5002';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // 👈 التعديل المهم
      callbackURL: `${BACKEND_BASE_URL}/api/users/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const photoUrl = profile.photos?.[0]?.value || '';

        let user = await User.findOne({ email });

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
            username: (profile.displayName || 'googleuser').toLowerCase().replace(/\s+/g, ''),
            email,
            password: hashedPassword,
            phone: '0000000000',
            fullName: profile.displayName || 'Google User',
            role: 'user',
            profileImage: savedFileName,
            verified: true,
          });
        } else {
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

          if (!user.verified) { user.verified = true; updated = true; }
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

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (err) { done(err, null); }
});

module.exports = passport;
