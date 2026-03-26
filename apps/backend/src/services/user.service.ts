import { db, users, reviews, messages, films, eq, and, or, desc, sql } from '@cineconnect/database';
import { FriendService } from './friend.service.js';
import bcrypt from 'bcryptjs';

/**
 * Service pour gérer les utilisateurs
 */
export class UserService {
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.getUserById(userId);
    if (!user) return { ok: false as const, reason: 'not_found' as const };

    const currentValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!currentValid) return { ok: false as const, reason: 'invalid_current_password' as const };

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.updatePassword(userId, newHash);
    return { ok: true as const };
  }

  static async deleteUserAccount(userId: number) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    return deleted ?? null;
  }

  static async getUserReviews(userId: number) {
    return db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        filmId: films.id,
        filmTitle: films.title,
        filmImdbId: films.imdbId,
        filmPosterUrl: films.posterUrl,
      })
      .from(reviews)
      .innerJoin(films, eq(films.id, reviews.filmId))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  static async getUserStats(userId: number) {
    const [reviewsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    const friendsList = await FriendService.listFriends(userId);

    const recentConversationsRaw = await Promise.all(
      friendsList.map(async (friend) => {
        const [lastMessage] = await db
          .select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
            receiverId: messages.receiverId,
          })
          .from(messages)
          .where(
            or(
              and(eq(messages.senderId, userId), eq(messages.receiverId, friend.otherUserId)),
              and(eq(messages.senderId, friend.otherUserId), eq(messages.receiverId, userId))
            )
          )
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          friendId: friend.otherUserId,
          friendName: friend.otherUserName,
          friendAvatar: friend.otherUserAvatar,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isMine: lastMessage.senderId === userId,
              }
            : null,
        };
      })
    );

    const recentConversations = recentConversationsRaw
      .filter((item) => item.lastMessage !== null)
      .sort((a, b) => {
        const aTime = new Date(a.lastMessage!.createdAt).getTime();
        const bTime = new Date(b.lastMessage!.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);

    return {
      reviewsCount: Number(reviewsResult?.count ?? 0),
      friendsCount: friendsList.length,
      recentConversations,
    };
  }

  /**
   * Récupère tous les utilisateurs
   */
  static async getAllUsers() {
    return await db.select().from(users);
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async getUserById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  /**
   * Récupère un utilisateur par son email
   */
  static async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async createUser(data: {
    email: string;
    name: string;
    passwordHash?: string;
    avatarUrl?: string | null;
  }) {
    const userData: any = {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash || '',
      avatarUrl: data.avatarUrl || null,
      isOnline: true,
    };

    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  /**
   * Met à jour le profil d'un utilisateur (name, bio, avatarUrl).
   */
  static async updateUser(
    id: number,
    data: { name?: string; bio?: string | null; avatarUrl?: string | null }
  ) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl;

    const result = await db
      .update(users)
      .set(updates as Record<string, string | Date | null>)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  /**
   * Stocke un token de réinitialisation de mot de passe pour un utilisateur.
   */
  static async setPasswordResetToken(id: number, tokenHash: string, expiresAt: Date) {
    const result = await db
      .update(users)
      .set({
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Supprime les informations de reset password d'un utilisateur.
   */
  static async clearPasswordResetToken(id: number) {
    const result = await db
      .update(users)
      .set({
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Met à jour le mot de passe et invalide tous les tokens de reset.
   */
  static async updatePassword(id: number, passwordHash: string) {
    const result = await db
      .update(users)
      .set({
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }
}

