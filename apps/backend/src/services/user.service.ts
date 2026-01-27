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
}

