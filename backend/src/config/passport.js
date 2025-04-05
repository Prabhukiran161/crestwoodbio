import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./dbPostgres.js";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Use INSERT ON CONFLICT to reduce DB queries
        const insertQuery = `
          INSERT INTO users (google_id, name, email) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (email) DO UPDATE 
          SET google_id = EXCLUDED.google_id 
          RETURNING id, google_id, name, email`;
        const values = [id, displayName, email];
        const { rows } = await pool.query(insertQuery, values);
        const user = rows[0];

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.google_id);
});

passport.deserializeUser(async (googleId, done) => {
  const { rows } = await pool.query("SELECT id, google_id, name, email FROM users WHERE google_id = $1", [googleId]);
  done(null, rows[0]);
});

export default passport;
