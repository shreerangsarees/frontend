import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user: any, done) => {
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

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        // Check if user has a password (might be OAuth only user)
        if (!user.password) {
            return done(null, false, { message: 'Please log in with your social account.' });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google Strategy
// NOTE: This will fail until valid credentials are provided in .env
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ providerId: profile.id, provider: 'google' });

                if (!user) {
                    // Check if email exists (maybe registered via another method) - simplistic handling
                    const existingEmail = await User.findOne({ email: profile.emails?.[0].value });
                    if (existingEmail) {
                        // Link account or just error? For now, let's just log in the existing user
                        // In production, you'd want to merge or ask to link.
                        return done(null, existingEmail);
                    }

                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0].value,
                        avatar: profile.photos?.[0].value,
                        provider: 'google',
                        providerId: profile.id
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    ));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ providerId: profile.id, provider: 'facebook' });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0].value || `${profile.id}@facebook.com`, // FB email permission might be missing
                        avatar: profile.photos?.[0].value,
                        provider: 'facebook',
                        providerId: profile.id
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    ));
}
