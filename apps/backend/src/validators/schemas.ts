import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Coerce string → int (for query / param parsing) */
const coerceInt = z.coerce.number().int();
const coercePositiveInt = z.coerce.number().int().positive();
const coerceFloat = z.coerce.number();

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email invalide'),
    name: z.string().trim().min(1, 'Le nom est requis'),
    password: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
      .regex(
        /[^a-zA-Z0-9]/,
        'Le mot de passe doit contenir au moins un caractère spécial',
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email invalide'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email invalide'),
    token: z.string().trim().min(1, 'Token requis'),
    password: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  }),
});

// ─── Films ────────────────────────────────────────────────────────────────────

export const getAllFilmsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    year: coerceInt.optional(),
    yearMin: coerceInt.optional(),
    yearMax: coerceInt.optional(),
    ratingMin: coerceFloat.optional(),
    ratingMax: coerceFloat.optional(),
    page: coercePositiveInt.optional(),
    limit: coercePositiveInt.optional(),
  }),
});

export const filmIdParamSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
});

export const createFilmSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Le titre est requis'),
    description: z.string().nullable().optional(),
    director: z.string().nullable().optional(),
    releaseYear: coerceInt.nullable().optional(),
    durationMinutes: coerceInt.nullable().optional(),
    posterUrl: z.string().url().nullable().optional(),
    categoryIds: z.array(coercePositiveInt).optional(),
  }),
});

export const updateFilmSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    director: z.string().nullable().optional(),
    releaseYear: coerceInt.nullable().optional(),
    durationMinutes: coerceInt.nullable().optional(),
    posterUrl: z.string().url().nullable().optional(),
    categoryIds: z.array(coercePositiveInt).optional(),
  }),
});

export const createReviewSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5, 'La note doit être entre 1 et 5'),
    comment: z.string().trim().optional(),
  }),
});

export const omdbSyncSchema = z.object({
  body: z.object({
    imdbId: z.string().min(1, 'imdbId est requis'),
    title: z.string().min(1, 'title est requis'),
    posterUrl: z.string().optional(),
    director: z.string().optional(),
    releaseYear: coerceInt.optional(),
    description: z.string().optional(),
  }),
});

export const reviewsByImdbIdSchema = z.object({
  params: z.object({
    imdbId: z.string().min(1, 'imdbId requis'),
  }),
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviewIdParamSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5, 'La note doit être entre 1 et 5').optional(),
    comment: z.string().trim().optional(),
  }),
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const userIdParamSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    bio: z.string().nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  }),
});

// ─── Friends ──────────────────────────────────────────────────────────────────

export const targetIdParamSchema = z.object({
  params: z.object({
    targetId: coercePositiveInt,
  }),
});

export const friendshipIdParamSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
});

export const friendIdParamSchema = z.object({
  params: z.object({
    friendId: coercePositiveInt,
  }),
});

export const searchUsersQuerySchema = z.object({
  query: z.object({
    q: z.string().min(2, 'La recherche doit contenir au moins 2 caractères').optional().default(''),
  }),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: coercePositiveInt,
  }),
});

// ─── OMDB ─────────────────────────────────────────────────────────────────────

export const omdbSearchQuerySchema = z.object({
  query: z.object({
    s: z.string().min(1, 'Le paramètre "s" (searchTerm) est requis'),
    page: coercePositiveInt.optional(),
    type: z.enum(['movie', 'series', 'episode']).optional(),
    year: coerceInt.optional(),
  }),
});

export const omdbImdbIdParamSchema = z.object({
  params: z.object({
    imdbId: z.string().min(1, 'ID IMDb requis'),
  }),
});

export const omdbTitleParamSchema = z.object({
  params: z.object({
    title: z.string().min(1, 'Titre requis'),
  }),
  query: z.object({
    year: coerceInt.optional(),
  }).optional(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messageFriendIdParamSchema = z.object({
  params: z.object({
    friendId: coercePositiveInt,
  }),
});
