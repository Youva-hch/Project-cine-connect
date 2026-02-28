import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import './strategies/google.strategy.js';
import { healthRouter } from './routes/health.routes.js';
import { userRouter } from './routes/user.routes.js';
import { filmRouter } from './routes/film.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { omdbRouter } from './routes/omdb.routes.js';
import { authRouter } from './routes/auth.routes.js';

const app: Express = express();
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
app.use('/api/films', filmRouter);
app.use('/api/reviews', reviewRouter);
app.use('/categories', categoryRouter);
app.use('/omdb', omdbRouter);

// Route par défaut
app.get('/', (_req, res) => {
  res.json({ message: 'CinéConnect API - Bienvenue !' });
});

// Démarrage du serveur (0.0.0.0 pour être joignable depuis l'extérieur du conteneur Docker)
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Erreur: Le port ${PORT} est déjà utilisé.`);
    console.error(`💡 Solutions:`);
    console.error(`   1. Arrêter le processus qui utilise le port ${PORT}`);
    console.error(`   2. Changer le port en définissant PORT=<autre_port> dans votre fichier .env`);
    console.error(`   3. Sous Windows, utiliser: netstat -ano | findstr :${PORT} pour trouver le PID`);
    console.error(`      Puis: taskkill /PID <PID> /F pour arrêter le processus`);
    process.exit(1);
  } else {
    console.error('❌ Erreur lors du démarrage du serveur:', err);
    process.exit(1);
  }
});

export default app;

