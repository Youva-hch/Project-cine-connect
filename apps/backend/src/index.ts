import 'dotenv/config';
import http from 'http';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import './strategies/google.strategy.js';
import { healthRouter } from './routes/health.routes.js';
import { userRouter } from './routes/user.routes.js';
import { filmRouter } from './routes/film.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { omdbRouter } from './routes/omdb.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { friendRouter } from './routes/friend.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import { messageRouter } from './routes/message.routes.js';
import { MessageService } from './services/message.service.js';
import { FriendService } from './services/friend.service.js';
import { setupSwagger } from './swagger.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const envOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([
  frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...envOrigins,
]));

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les clients sans en-tête Origin (curl, mobile app, health checks)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);

    if (allowedOrigins.includes(normalizedOrigin) || isLocalDevOrigin) {
      return callback(null, true);
    }

    // Ne pas lever d'erreur ici: un throw provoquerait une 500 sans en-tête CORS.
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes HTTP
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/users', userRouter);
app.use('/api/films', filmRouter);
app.use('/api/reviews', reviewRouter);
app.use('/categories', categoryRouter);
app.use('/omdb', omdbRouter);
app.use('/api/friends', friendRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/messages', messageRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'CinéConnect API - Bienvenue !' });
});

// Documentation Swagger (accessible sur /api-docs)
setupSwagger(app);

// ─── Serveur HTTP + Socket.io ─────────────────────────────────────────────
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Map userId → socketId pour savoir qui est connecté
const onlineUsers = new Map<number, string>();

// Auth Socket.io via JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string;
  if (!token) return next(new Error('Token manquant'));

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: number; email: string };
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId as number;
  onlineUsers.set(userId, socket.id);
  console.log(`🟢 User ${userId} connecté (socket: ${socket.id})`);

  // Envoi d'un message
  socket.on('sendMessage', async (data: { receiverId: number; content: string }) => {
    try {
      const { receiverId, content } = data;
      if (!content?.trim()) return;

      // Vérifier qu'ils sont amis
      const friendship = await FriendService.getFriendshipStatus(userId, receiverId);
      if (!friendship || friendship.status !== 'accepted') {
        socket.emit('error', { message: 'Vous ne pouvez écrire qu\'à vos amis' });
        return;
      }

      // Persister en BDD
      const message = await MessageService.saveMessage(userId, receiverId, content.trim());

      // Envoyer au destinataire s'il est connecté
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', message);
      }

      // Confirmer à l'expéditeur
      socket.emit('receiveMessage', message);
    } catch (err) {
      console.error('Erreur sendMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`🔴 User ${userId} déconnecté`);
  });
});

// Export de l'app pour les tests
export { app };

// Démarrage
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Socket.io actif`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé.`);
    process.exit(1);
  } else {
    console.error('❌ Erreur serveur:', err);
    process.exit(1);
  }
});

export default app;
