import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { UserService } from '../services/user.service.js'
import bcrypt from 'bcryptjs'

const hasGoogleConfig =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET

if (hasGoogleConfig) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.trim()
          if (!email) {
            return done(new Error('Email Google non fourni'), null)
          }

          let user = await UserService.getUserByEmail(email)
          if (user) {
            return done(null, user)
          }

          const name =
            profile.displayName ||
            profile.name?.givenName ||
            profile.name?.familyName ||
            'Utilisateur Google'
          const passwordHash = await bcrypt.hash(
            Math.random().toString(36) + Date.now(),
            10
          )
          const avatarUrl = profile.photos?.[0]?.value || null

          const newUser = await UserService.createUser({
            email,
            name,
            passwordHash,
            avatarUrl,
          })
          if (!newUser) {
            return done(new Error('Erreur création compte'), null)
          }
          return done(null, newUser)
        } catch (error) {
          console.error('Google strategy error:', error)
          return done(error, null)
        }
      }
    )
  )
} else {
  console.warn(
    'Google OAuth non configuré (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET manquants). Connexion Google désactivée.'
  )
}

passport.serializeUser((user: { id: number }, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await UserService.getUserById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
