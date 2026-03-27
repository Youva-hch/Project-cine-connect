import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { categories } from './schema.js';
import { inArray, eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env dans le même ordre que les migrations pour cibler la bonne base.
dotenv.config();
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config({ path: resolve(__dirname, '../../../apps/backend/.env') });

const OMDB_CATEGORY_SEED: Array<{ name: string; slug: string; description: string }> = [
  { name: 'Action', slug: 'action', description: 'Action movies' },
  { name: 'Adventure', slug: 'aventure', description: 'Adventure movies' },
  { name: 'Animation', slug: 'animation', description: 'Animated movies and series' },
  { name: 'Biography', slug: 'biographie', description: 'Biography movies' },
  { name: 'Comedy', slug: 'comedie', description: 'Comedy movies' },
  { name: 'Crime', slug: 'crime', description: 'Crime movies' },
  { name: 'Documentary', slug: 'documentaire', description: 'Documentary movies' },
  { name: 'Drama', slug: 'drame', description: 'Drama movies' },
  { name: 'Family', slug: 'famille', description: 'Family movies' },
  { name: 'Fantasy', slug: 'fantastique', description: 'Fantasy movies' },
  { name: 'Film-Noir', slug: 'film-noir', description: 'Film-noir movies' },
  { name: 'History', slug: 'histoire', description: 'History movies' },
  { name: 'Horror', slug: 'horreur', description: 'Horror movies' },
  { name: 'Music', slug: 'musique', description: 'Music movies' },
  { name: 'Musical', slug: 'musical', description: 'Musical movies' },
  { name: 'Mystery', slug: 'mystere', description: 'Mystery movies' },
  { name: 'Romance', slug: 'romance', description: 'Romance movies' },
  { name: 'Sci-Fi', slug: 'science-fiction', description: 'Science-fiction movies' },
  { name: 'Sport', slug: 'sport', description: 'Sport movies' },
  { name: 'Thriller', slug: 'thriller', description: 'Thriller movies' },
  { name: 'War', slug: 'guerre', description: 'War movies' },
  { name: 'Western', slug: 'western', description: 'Western movies' },
  { name: 'Adult', slug: 'adult', description: 'Adult content' },
  { name: 'Game-Show', slug: 'game-show', description: 'Game-show content' },
  { name: 'News', slug: 'news', description: 'News content' },
  { name: 'Reality-TV', slug: 'reality-tv', description: 'Reality TV content' },
  { name: 'Short', slug: 'short', description: 'Short films' },
  { name: 'Talk-Show', slug: 'talk-show', description: 'Talk-show content' },
];

async function seedOmdbCategories() {
  const { db } = await import('./index.js');

  console.log('🌱 Seeding OMDb categories...');

  await db.insert(categories).values(OMDB_CATEGORY_SEED).onConflictDoNothing();

  for (const item of OMDB_CATEGORY_SEED) {
    await db
      .update(categories)
      .set({
        name: item.name,
        description: item.description,
      })
      .where(eq(categories.slug, item.slug));
  }

  const slugs = OMDB_CATEGORY_SEED.map((item) => item.slug);
  const seededCategories = await db
    .select()
    .from(categories)
    .where(inArray(categories.slug, slugs))
    .orderBy(categories.name);

  console.log(`✅ OMDb categories seeded: ${seededCategories.length}`);
}

seedOmdbCategories()
  .then(() => {
    console.log('Seed OMDb categories completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed OMDb categories failed:', error);
    process.exit(1);
  });
