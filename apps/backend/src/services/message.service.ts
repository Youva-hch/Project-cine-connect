import { db, messages, users, eq, and, or, asc } from '@cineconnect/database';

export class MessageService {
  // Sauvegarder un message en BDD
  static async saveMessage(senderId: number, receiverId: number, content: string) {
    const [msg] = await db
      .insert(messages)
      .values({ senderId, receiverId, content })
      .returning();

    // Récupérer les infos de l'expéditeur pour le retourner complet
    const [sender] = await db
      .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, senderId))
      .limit(1);

    return { ...msg, sender };
  }

  // Historique de la conversation entre deux users (ordonné chronologiquement)
  static async getConversation(userA: number, userB: number) {
    const rows = await db
      .select({
        id: messages.id,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        senderName: users.name,
        senderAvatar: users.avatarUrl,
      })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(
        or(
          and(eq(messages.senderId, userA), eq(messages.receiverId, userB)),
          and(eq(messages.senderId, userB), eq(messages.receiverId, userA))
        )
      )
      .orderBy(asc(messages.createdAt))
      .limit(100);

    return rows;
  }

  // Marquer les messages reçus comme lus
  static async markConversationAsRead(receiverId: number, senderId: number) {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(eq(messages.receiverId, receiverId), eq(messages.senderId, senderId))
      );
  }
}
