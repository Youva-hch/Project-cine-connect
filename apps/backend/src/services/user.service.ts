import { db, users, eq } from '@cineconnect/database';

/**
 * Service pour gérer les utilisateurs
 */
export class UserService {
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
}

