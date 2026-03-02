import { db, friends, users, eq, and, or } from '@cineconnect/database';
import { NotificationService } from './notification.service.js';

export class FriendService {
  static async sendFriendRequest(senderId: number, targetId: number) {
    if (senderId === targetId) throw new Error('Vous ne pouvez pas vous ajouter vous-même');

    // Vérifier si une relation existe déjà
    const existing = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, senderId), eq(friends.friendId, targetId)),
          and(eq(friends.userId, targetId), eq(friends.friendId, senderId))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Une demande ou relation existe déjà');
    }

    const [friendship] = await db
      .insert(friends)
      .values({ userId: senderId, friendId: targetId, status: 'pending' })
      .returning();

    // Récupérer le nom de l'expéditeur pour la notification
    const [sender] = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId)).limit(1);
    await NotificationService.createNotification(
      targetId,
      'friend_request',
      senderId,
      `${sender?.name ?? 'Quelqu\'un'} vous a envoyé une demande d'ami`
    );

    return friendship;
  }

  static async acceptRequest(friendshipId: number, userId: number) {
    const [friendship] = await db
      .select()
      .from(friends)
      .where(and(eq(friends.id, friendshipId), eq(friends.friendId, userId)))
      .limit(1);

    if (!friendship) throw new Error('Demande introuvable');
    if (friendship.status !== 'pending') throw new Error('Demande déjà traitée');

    await db
      .update(friends)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(friends.id, friendshipId));

    // Notifier l'expéditeur que sa demande a été acceptée
    const [acceptor] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    await NotificationService.createNotification(
      friendship.userId,
      'friend_accepted',
      userId,
      `${acceptor?.name ?? 'Quelqu\'un'} a accepté votre demande d'ami`
    );

    return friendship;
  }

  static async rejectRequest(friendshipId: number, userId: number) {
    const [friendship] = await db
      .select()
      .from(friends)
      .where(and(eq(friends.id, friendshipId), eq(friends.friendId, userId)))
      .limit(1);

    if (!friendship) throw new Error('Demande introuvable');

    await db
      .update(friends)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(friends.id, friendshipId));
  }

  static async listFriends(userId: number) {
    // Amis où l'utilisateur est userId ou friendId (bidirectionnel)
    const rows = await db
      .select({
        friendshipId: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        status: friends.status,
        createdAt: friends.createdAt,
        otherUserId: users.id,
        otherUserName: users.name,
        otherUserAvatar: users.avatarUrl,
        otherUserEmail: users.email,
      })
      .from(friends)
      .innerJoin(
        users,
        or(
          and(eq(friends.userId, userId), eq(users.id, friends.friendId)),
          and(eq(friends.friendId, userId), eq(users.id, friends.userId))
        )
      )
      .where(and(
        eq(friends.status, 'accepted'),
        or(eq(friends.userId, userId), eq(friends.friendId, userId))
      ));

    return rows;
  }

  static async listReceivedRequests(userId: number) {
    const rows = await db
      .select({
        friendshipId: friends.id,
        status: friends.status,
        createdAt: friends.createdAt,
        senderId: users.id,
        senderName: users.name,
        senderAvatar: users.avatarUrl,
        senderEmail: users.email,
      })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.userId))
      .where(and(eq(friends.friendId, userId), eq(friends.status, 'pending')));

    return rows;
  }

  static async listSentRequests(userId: number) {
    const rows = await db
      .select({
        friendshipId: friends.id,
        status: friends.status,
        createdAt: friends.createdAt,
        targetId: users.id,
        targetName: users.name,
        targetAvatar: users.avatarUrl,
      })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.friendId))
      .where(and(eq(friends.userId, userId), eq(friends.status, 'pending')));

    return rows;
  }

  static async removeFriend(userId: number, friendId: number) {
    await db
      .delete(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      );
  }

  static async getFriendshipStatus(userA: number, userB: number) {
    const [row] = await db
      .select({ id: friends.id, status: friends.status, userId: friends.userId, friendId: friends.friendId })
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userA), eq(friends.friendId, userB)),
          and(eq(friends.userId, userB), eq(friends.friendId, userA))
        )
      )
      .limit(1);

    return row ?? null;
  }
}
