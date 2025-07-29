const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ provider: "google", providerId: profile.id });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            firstName: profile.name.givenName || "Google",
            lastName: profile.name.familyName || "User",
            profileImage: profile.photos[0]?.value || "",
            phone: "0000000000",
            address: "N/A",
            provider: "google",
            providerId: profile.id,
            verified: true,
          });

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});
module.exports = passport;
