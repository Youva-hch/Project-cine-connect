import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// ============================================================================
// Table: users
// ============================================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isOnline: boolean('is_online').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Table: films
// ============================================================================
export const films = pgTable('films', {
  id: serial('id').primaryKey(),
  imdbId: text('imdb_id').unique(),
  title: text('title').notNull(),
  description: text('description'),
  director: text('director'),
  releaseYear: integer('release_year'),
  durationMinutes: integer('duration_minutes'),
  posterUrl: text('poster_url'),
  ratingAverage: decimal('rating_average', { precision: 3, scale: 2 })
    .default('0.00')
    .notNull(),
  ratingCount: integer('rating_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Table: categories
// ============================================================================
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Table: reviews
// ============================================================================
// Note: Contrainte CHECK pour rating (1-5) doit être ajoutée via migration SQL
export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    filmId: integer('film_id')
      .notNull()
      .references(() => films.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // Doit être entre 1 et 5 (CHECK via migration)
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserFilm: unique().on(table.userId, table.filmId),
  })
);

// ============================================================================
// Table: messages
// ============================================================================
// Note: Contrainte CHECK pour sender_id != receiver_id doit être ajoutée via migration SQL
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Table: friends
// ============================================================================
// Note: Contraintes CHECK pour status et user_id != friend_id doivent être ajoutées via migration SQL
export const friends = pgTable(
  'friends',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    friendId: integer('friend_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status')
      .notNull()
      .default('pending'), // Doit être 'pending', 'accepted' ou 'rejected' (CHECK via migration)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueFriendship: unique().on(table.userId, table.friendId),
  })
);

// ============================================================================
// Table: notifications
// ============================================================================
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'friend_request' | 'friend_accepted' | 'message'
  relatedUserId: integer('related_user_id')
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Table de liaison: film_categories (N-N)
// ============================================================================
export const filmCategories = pgTable(
  'film_categories',
  {
    filmId: integer('film_id')
      .notNull()
      .references(() => films.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.filmId, table.categoryId] }),
  })
);

// ============================================================================
// Relations Drizzle ORM
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
  friendships: many(friends, { relationName: 'user' }),
  friendOf: many(friends, { relationName: 'friend' }),
  notifications: many(notifications, { relationName: 'notifTarget' }),
}));

export const filmsRelations = relations(films, ({ many }) => ({
  reviews: many(reviews),
  categories: many(filmCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  films: many(filmCategories),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  film: one(films, {
    fields: [reviews.filmId],
    references: [films.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
    relationName: 'user',
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
    relationName: 'friend',
  }),
}));

export const filmCategoriesRelations = relations(filmCategories, ({ one }) => ({
  film: one(films, {
    fields: [filmCategories.filmId],
    references: [films.id],
  }),
  category: one(categories, {
    fields: [filmCategories.categoryId],
    references: [categories.id],
  }),
}));

// ============================================================================
// TypeScript Types
// ============================================================================

// Types pour la table users
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Types pour la table films
export type Film = InferSelectModel<typeof films>;
export type NewFilm = InferInsertModel<typeof films>;

// Types pour la table categories
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

// Types pour la table reviews
export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

// Types pour la table messages
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

// Types pour la table friends
export type Friend = InferSelectModel<typeof friends>;
export type NewFriend = InferInsertModel<typeof friends>;

// Types pour la table film_categories
export type FilmCategory = InferSelectModel<typeof filmCategories>;
export type NewFilmCategory = InferInsertModel<typeof filmCategories>;

// Types pour la table notifications
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

