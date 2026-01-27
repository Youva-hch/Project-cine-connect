/**
 * Script pour récupérer 150 films depuis l'API OMDb et les insérer dans la base de données
 * 
 * Usage: pnpm tsx src/scripts/seed-omdb-films.ts
 */

import 'dotenv/config';
import { db, films, categories, filmCategories, eq, sql, and } from '@cineconnect/database';
import { OMDbService } from '../services/omdb.service.js';

// Mapping des genres OMDb vers nos catégories
const genreToCategoryMap: Record<string, string> = {
  'Action': 'action',
  'Adventure': 'aventure',
  'Animation': 'animation',
  'Biography': 'biographie',
  'Comedy': 'comedie',
  'Crime': 'crime',
  'Documentary': 'documentaire',
  'Drama': 'drame',
  'Family': 'famille',
  'Fantasy': 'fantastique',
  'Film-Noir': 'film-noir',
  'History': 'histoire',
  'Horror': 'horreur',
  'Music': 'musique',
  'Musical': 'musical',
  'Mystery': 'mystere',
  'Romance': 'romance',
  'Sci-Fi': 'science-fiction',
  'Sport': 'sport',
  'Thriller': 'thriller',
  'War': 'guerre',
  'Western': 'western',
};

/**
 * Convertit les données OMDb en format pour notre base de données
 */
function convertOMDbToFilm(omdbMovie: any) {
  // Extraire l'année
  const year = omdbMovie.Year ? parseInt(omdbMovie.Year.split('–')[0], 10) : null;

  // Extraire la durée en minutes
  let durationMinutes: number | null = null;
  if (omdbMovie.Runtime && omdbMovie.Runtime !== 'N/A') {
    const runtimeMatch = omdbMovie.Runtime.match(/(\d+)/);
    if (runtimeMatch) {
      durationMinutes = parseInt(runtimeMatch[1], 10);
    }
  }

  // Calculer la note moyenne (utiliser IMDb rating si disponible)
  let ratingAverage = 0;
  let ratingCount = 0;
  if (omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A') {
    ratingAverage = parseFloat(omdbMovie.imdbRating);
    ratingCount = omdbMovie.imdbVotes && omdbMovie.imdbVotes !== 'N/A'
      ? parseInt(omdbMovie.imdbVotes.replace(/,/g, ''), 10)
      : 0;
  }

  return {
    title: omdbMovie.Title,
    description: omdbMovie.Plot && omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : null,
    director: omdbMovie.Director && omdbMovie.Director !== 'N/A' ? omdbMovie.Director : null,
    releaseYear: year,
    durationMinutes,
    posterUrl: omdbMovie.Poster && omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null,
    ratingAverage: ratingAverage.toString(),
    ratingCount,
  };
}

/**
 * Récupère ou crée une catégorie par son slug
 */
async function getOrCreateCategory(slug: string, name: string) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newCategory] = await db
    .insert(categories)
    .values({
      name,
      slug,
      description: `Catégorie ${name}`,
    })
    .returning();

  return newCategory;
}

/**
 * Associe un film à des catégories basées sur ses genres
 */
async function linkFilmToCategories(filmId: number, genres: string[]) {
  for (const genre of genres) {
    const categorySlug = genreToCategoryMap[genre.trim()];
    if (!categorySlug) continue;

    try {
      const category = await getOrCreateCategory(categorySlug, genre.trim());

      // Vérifier si la liaison existe déjà
      const existing = await db
        .select()
        .from(filmCategories)
        .where(
          sql`${filmCategories.filmId} = ${filmId} AND ${filmCategories.categoryId} = ${category.id}`
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(filmCategories).values({
          filmId,
          categoryId: category.id,
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la liaison du film ${filmId} à la catégorie ${genre}:`, error);
    }
  }
}

/**
 * Fonction principale
 */
async function seedOMDbFilms() {
  try {
    console.log('🚀 Début du seed des films depuis OMDb...\n');

    // Récupérer 200 films depuis OMDb
    const omdbMovies = await OMDbService.getPopularMovies(200);

    if (omdbMovies.length === 0) {
      console.log('❌ Aucun film récupéré depuis OMDb');
      return;
    }

    console.log(`\n📦 ${omdbMovies.length} films récupérés, insertion dans la base de données...\n`);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const omdbMovie of omdbMovies) {
      try {
        const filmData = convertOMDbToFilm(omdbMovie);

        // Ignorer les films sans affiche
        if (!filmData.posterUrl || filmData.posterUrl === 'N/A' || filmData.posterUrl === '') {
          console.log(`⊘ Ignoré (sans affiche): ${filmData.title} (${filmData.releaseYear})`);
          skippedCount++;
          continue;
        }

        // Vérifier si le film existe déjà (par titre et année)
        let existing;
        if (filmData.releaseYear) {
          existing = await db
            .select()
            .from(films)
            .where(
              and(
                eq(films.title, filmData.title),
                eq(films.releaseYear, filmData.releaseYear)
              )
            )
            .limit(1);
        } else {
          existing = await db
            .select()
            .from(films)
            .where(eq(films.title, filmData.title))
            .limit(1);
        }

        if (existing.length > 0) {
          // Mettre à jour le film existant
          await db
            .update(films)
            .set({
              ...filmData,
              updatedAt: new Date(),
            })
            .where(eq(films.id, existing[0].id));

          // Lier aux catégories
          if (omdbMovie.Genre) {
            const genres = omdbMovie.Genre.split(',').map(g => g.trim());
            await linkFilmToCategories(existing[0].id, genres);
          }

          updatedCount++;
          console.log(`✓ Mis à jour: ${filmData.title} (${filmData.releaseYear})`);
        } else {
          // Insérer le nouveau film
          const [newFilm] = await db
            .insert(films)
            .values(filmData)
            .returning();

          // Lier aux catégories
          if (omdbMovie.Genre) {
            const genres = omdbMovie.Genre.split(',').map(g => g.trim());
            await linkFilmToCategories(newFilm.id, genres);
          }

          insertedCount++;
          console.log(`+ Ajouté: ${filmData.title} (${filmData.releaseYear})`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${omdbMovie.Title}:`, error);
        skippedCount++;
      }
    }

    console.log(`\n✅ Seed terminé !`);
    console.log(`   - ${insertedCount} films ajoutés`);
    console.log(`   - ${updatedCount} films mis à jour`);
    console.log(`   - ${skippedCount} films ignorés (erreurs)`);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

// Exécuter le script
seedOMDbFilms()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

