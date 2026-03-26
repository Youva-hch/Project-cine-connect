import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { sql } from 'drizzle-orm';
import {
  users,
  categories,
  films,
  reviews,
  messages,
  friends,
  filmCategories,
} from './schema.js';

/**
 * Seed function to populate the database with initial data
 * Run with: pnpm db:seed
 * 
 * Note: Si les données existent déjà, le script récupère les données existantes
 * pour continuer avec les relations. Pour réinitialiser complètement :
 * 1. Vider la base : TRUNCATE TABLE users, films, categories, reviews, messages, friends, film_categories CASCADE;
 * 2. Réexécuter : pnpm db:seed
 */
export async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Hash password pour les utilisateurs (mot de passe par défaut: "password123")
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Créer des utilisateurs (ignore les doublons)
    console.log('📝 Creating users...');
    let insertedUsers;
    try {
      insertedUsers = await db
        .insert(users)
        .values([
          {
            email: 'admin@cineconnect.com',
            name: 'Admin User',
            passwordHash: hashedPassword,
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            bio: 'Administrateur de CinéConnect',
            isOnline: true,
          },
          {
            email: 'alice@cineconnect.com',
            name: 'Alice Martin',
            passwordHash: hashedPassword,
            avatarUrl: 'https://i.pravatar.cc/150?img=5',
            bio: 'Passionnée de cinéma indépendant',
            isOnline: true,
          },
          {
            email: 'bob@cineconnect.com',
            name: 'Bob Dupont',
            passwordHash: hashedPassword,
            avatarUrl: 'https://i.pravatar.cc/150?img=12',
            bio: 'Fan de films d\'action et de science-fiction',
            isOnline: false,
          },
          {
            email: 'charlie@cineconnect.com',
            name: 'Charlie Brown',
            passwordHash: hashedPassword,
            avatarUrl: 'https://i.pravatar.cc/150?img=15',
            bio: 'Critique de cinéma amateur',
            isOnline: true,
          },
        ])
        .returning();
    } catch (error: any) {
      // Si erreur, récupérer les utilisateurs existants
      if (error.code === '23505') {
        console.log('⚠️  Users already exist, fetching existing users...');
        insertedUsers = await db
          .select()
          .from(users)
          .where(
            sql`email IN ('admin@cineconnect.com', 'alice@cineconnect.com', 'bob@cineconnect.com', 'charlie@cineconnect.com')`
          );
      } else {
        throw error;
      }
    }

    console.log(`✅ Created ${insertedUsers.length} users`);

    // 2. Créer des catégories
    console.log('📝 Creating categories...');
    let insertedCategories;
    try {
      insertedCategories = await db
        .insert(categories)
        .values([
        {
          name: 'Action',
          description: 'Films d\'action avec scènes de combat et poursuites',
          slug: 'action',
        },
        {
          name: 'Comédie',
          description: 'Films comiques et humoristiques',
          slug: 'comedie',
        },
        {
          name: 'Drame',
          description: 'Films dramatiques avec des histoires émotionnelles',
          slug: 'drame',
        },
        {
          name: 'Science-Fiction',
          description: 'Films de science-fiction et futuristes',
          slug: 'science-fiction',
        },
        {
          name: 'Thriller',
          description: 'Films à suspense et thriller',
          slug: 'thriller',
        },
        {
          name: 'Horreur',
          description: 'Films d\'horreur et de terreur',
          slug: 'horreur',
        },
      ])
      .returning();
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('⚠️  Categories already exist, fetching existing categories...');
        insertedCategories = await db
          .select()
          .from(categories)
          .where(
            sql`slug IN ('action', 'comedie', 'drame', 'science-fiction', 'thriller', 'horreur')`
          );
      } else {
        throw error;
      }
    }

    console.log(`✅ Created ${insertedCategories.length} categories`);

    // 3. Créer des films
    console.log('📝 Creating films...');
    let insertedFilms;
    try {
      insertedFilms = await db
        .insert(films)
        .values([
        {
          title: 'Inception',
          description:
            'Un voleur expérimenté qui s\'infiltre dans les rêves des autres doit accomplir une mission impossible : l\'inception.',
          director: 'Christopher Nolan',
          releaseYear: 2010,
          durationMinutes: 148,
          posterUrl: null,
          ratingAverage: '4.5',
          ratingCount: 0,
        },
        {
          title: 'The Dark Knight',
          description:
            'Batman doit accepter l\'un des plus grands tests psychologiques et physiques de sa capacité à lutter contre l\'injustice.',
          director: 'Christopher Nolan',
          releaseYear: 2008,
          durationMinutes: 152,
          posterUrl: null,
          ratingAverage: '4.8',
          ratingCount: 0,
        },
        {
          title: 'Pulp Fiction',
          description:
            'Les vies de deux tueurs à gages, d\'un boxeur, d\'un gangster et de sa femme s\'entremêlent dans quatre histoires de violence et de rédemption.',
          director: 'Quentin Tarantino',
          releaseYear: 1994,
          durationMinutes: 154,
          posterUrl: null,
          ratingAverage: '4.6',
          ratingCount: 0,
        },
        {
          title: 'The Matrix',
          description:
            'Un informaticien découvre que la réalité qu\'il connaît est une simulation créée par des machines.',
          director: 'Lana Wachowski, Lilly Wachowski',
          releaseYear: 1999,
          durationMinutes: 136,
          posterUrl: null,
          ratingAverage: '4.7',
          ratingCount: 0,
        },
        {
          title: 'Fight Club',
          description:
            'Un employé de bureau insomniaque et un fabricant de savon forment un club de combat souterrain qui évolue en quelque chose de bien plus grand.',
          director: 'David Fincher',
          releaseYear: 1999,
          durationMinutes: 139,
          posterUrl: null,
          ratingAverage: '4.4',
          ratingCount: 0,
        },
        {
          title: 'Forrest Gump',
          description:
            'L\'histoire de la vie d\'un homme simple du Alabama qui traverse plusieurs décennies de l\'histoire américaine.',
          director: 'Robert Zemeckis',
          releaseYear: 1994,
          durationMinutes: 142,
          posterUrl: null,
          ratingAverage: '4.5',
          ratingCount: 0,
        },
      ])
      .returning();
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('⚠️  Films already exist, fetching existing films...');
        insertedFilms = await db
          .select()
          .from(films)
          .where(
            sql`title IN ('Inception', 'The Dark Knight', 'Pulp Fiction', 'The Matrix', 'Fight Club', 'Forrest Gump')`
          );
      } else {
        throw error;
      }
    }

    console.log(`✅ Created ${insertedFilms.length} films`);

    // 4. Associer les films aux catégories
    console.log('📝 Linking films to categories...');
    const categoryMap = {
      action: insertedCategories.find((c) => c.slug === 'action')!.id,
      comedie: insertedCategories.find((c) => c.slug === 'comedie')!.id,
      drame: insertedCategories.find((c) => c.slug === 'drame')!.id,
      'science-fiction': insertedCategories.find((c) => c.slug === 'science-fiction')!.id,
      thriller: insertedCategories.find((c) => c.slug === 'thriller')!.id,
      horreur: insertedCategories.find((c) => c.slug === 'horreur')!.id,
    };

    await db.insert(filmCategories).values([
      // Inception: Action, Science-Fiction, Thriller
      { filmId: insertedFilms[0].id, categoryId: categoryMap.action },
      { filmId: insertedFilms[0].id, categoryId: categoryMap['science-fiction'] },
      { filmId: insertedFilms[0].id, categoryId: categoryMap.thriller },
      // The Dark Knight: Action, Thriller, Drame
      { filmId: insertedFilms[1].id, categoryId: categoryMap.action },
      { filmId: insertedFilms[1].id, categoryId: categoryMap.thriller },
      { filmId: insertedFilms[1].id, categoryId: categoryMap.drame },
      // Pulp Fiction: Thriller, Drame
      { filmId: insertedFilms[2].id, categoryId: categoryMap.thriller },
      { filmId: insertedFilms[2].id, categoryId: categoryMap.drame },
      // The Matrix: Action, Science-Fiction
      { filmId: insertedFilms[3].id, categoryId: categoryMap.action },
      { filmId: insertedFilms[3].id, categoryId: categoryMap['science-fiction'] },
      // Fight Club: Drame, Thriller
      { filmId: insertedFilms[4].id, categoryId: categoryMap.drame },
      { filmId: insertedFilms[4].id, categoryId: categoryMap.thriller },
      // Forrest Gump: Drame, Comédie
      { filmId: insertedFilms[5].id, categoryId: categoryMap.drame },
      { filmId: insertedFilms[5].id, categoryId: categoryMap.comedie },
    ]);

    console.log('✅ Linked films to categories');

    // 5. Créer des avis (reviews)
    console.log('📝 Creating reviews...');
    await db.insert(reviews).values([
      {
        userId: insertedUsers[1].id, // Alice
        filmId: insertedFilms[0].id, // Inception
        rating: 5,
        comment: 'Un chef-d\'œuvre ! La complexité du scénario et les effets visuels sont époustouflants.',
      },
      {
        userId: insertedUsers[2].id, // Bob
        filmId: insertedFilms[0].id, // Inception
        rating: 4,
        comment: 'Très bon film, mais un peu complexe à suivre.',
      },
      {
        userId: insertedUsers[1].id, // Alice
        filmId: insertedFilms[1].id, // The Dark Knight
        rating: 5,
        comment: 'Le meilleur film de super-héros de tous les temps !',
      },
      {
        userId: insertedUsers[3].id, // Charlie
        filmId: insertedFilms[1].id, // The Dark Knight
        rating: 5,
        comment: 'Heath Ledger est exceptionnel dans le rôle du Joker.',
      },
      {
        userId: insertedUsers[2].id, // Bob
        filmId: insertedFilms[3].id, // The Matrix
        rating: 5,
        comment: 'Révolutionnaire à l\'époque, toujours aussi impressionnant aujourd\'hui.',
      },
      {
        userId: insertedUsers[3].id, // Charlie
        filmId: insertedFilms[5].id, // Forrest Gump
        rating: 4,
        comment: 'Un film touchant avec une performance remarquable de Tom Hanks.',
      },
    ]);

    console.log('✅ Created reviews');

    // 6. Créer des relations d'amitié
    console.log('📝 Creating friendships...');
    await db.insert(friends).values([
      {
        userId: insertedUsers[1].id, // Alice
        friendId: insertedUsers[2].id, // Bob
        status: 'accepted',
      },
      {
        userId: insertedUsers[1].id, // Alice
        friendId: insertedUsers[3].id, // Charlie
        status: 'accepted',
      },
      {
        userId: insertedUsers[2].id, // Bob
        friendId: insertedUsers[3].id, // Charlie
        status: 'pending',
      },
    ]);

    console.log('✅ Created friendships');

    // 7. Créer des messages
    console.log('📝 Creating messages...');
    await db.insert(messages).values([
      {
        senderId: insertedUsers[1].id, // Alice
        receiverId: insertedUsers[2].id, // Bob
        content: 'Salut Bob ! As-tu vu Inception ? Je l\'ai adoré !',
        isRead: true,
      },
      {
        senderId: insertedUsers[2].id, // Bob
        receiverId: insertedUsers[1].id, // Alice
        content: 'Oui, je l\'ai vu hier soir. C\'était vraiment bien !',
        isRead: true,
      },
      {
        senderId: insertedUsers[1].id, // Alice
        receiverId: insertedUsers[3].id, // Charlie
        content: 'Tu devrais regarder The Dark Knight, c\'est incroyable !',
        isRead: false,
      },
      {
        senderId: insertedUsers[3].id, // Charlie
        receiverId: insertedUsers[1].id, // Alice
        content: 'Merci pour la recommandation, je vais le regarder ce weekend !',
        isRead: false,
      },
    ]);

    console.log('✅ Created messages');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${insertedUsers.length} users created`);
    console.log(`   - ${insertedCategories.length} categories created`);
    console.log(`   - ${insertedFilms.length} films created`);
    console.log('   - Film-category links created');
    console.log('   - Reviews created');
    console.log('   - Friendships created');
    console.log('   - Messages created');
    console.log('\n🔑 Default password for all users: password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });

