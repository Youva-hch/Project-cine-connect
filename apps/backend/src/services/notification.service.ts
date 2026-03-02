import { db, notifications, users, eq, and, desc } from '@cineconnect/database';

export class NotificationService {
  static async createNotification(
    userId: number,
    type: string,
    relatedUserId: number,
    message: string
  ) {
    const [notif] = await db
      .insert(notifications)
      .values({ userId, type, relatedUserId, message })
      .returning();
    return notif;
  }

  static async listNotifications(userId: number) {
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        relatedUserId: notifications.relatedUserId,
        relatedUserName: users.name,
        relatedUserAvatar: users.avatarUrl,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.relatedUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return rows;
  }

  static async getUnreadCount(userId: number) {
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return rows.length;
  }

  static async markAsRead(notificationId: number, userId: number) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  static async markAllAsRead(userId: number) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}
