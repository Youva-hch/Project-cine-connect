import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserService } from '../services/user.service.js';
import bcrypt from 'bcryptjs';

/**
 * Configuration de la stratégie Google OAuth
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe déjà
        let user = await UserService.getUserByEmail(profile.emails?.[0]?.value || '');

        if (user) {
          // Utilisateur existant, retourner l'utilisateur
          return done(null, user);
        }

        // Créer un nouvel utilisateur
        const newUser = await UserService.createUser({
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || profile.name?.givenName || 'Utilisateur Google',
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Mot de passe aléatoire
          avatarUrl: profile.photos?.[0]?.value || null,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await UserService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

