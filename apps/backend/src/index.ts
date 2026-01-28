import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import './strategies/google.strategy.js';
import { healthRouter } from './routes/health.routes.js';
import { userRouter } from './routes/user.routes.js';
import { filmRouter } from './routes/film.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { omdbRouter } from './routes/omdb.routes.js';
import { authRouter } from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet());
// CORS : normaliser l'origine (sans slash final) pour matcher l'en-tête Origin du navigateur
const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({
  origin: [frontendOrigin, frontendOrigin + '/'],
  credentials: true,
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session pour Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/users', userRouter);
app.use('/films', filmRouter);
app.use('/categories', categoryRouter);
app.use('/omdb', omdbRouter);

// Route par défaut
app.get('/', (_req, res) => {
  res.json({ message: 'CinéConnect API - Bienvenue !' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;

