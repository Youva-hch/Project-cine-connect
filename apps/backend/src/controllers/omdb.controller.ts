import { Request, Response } from 'express';
import { OMDbService } from '../services/omdb.service.js';
import { db, films, categories, filmCategories, eq, sql, and } from '@cineconnect/database';

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

function convertOMDbToFilm(omdbMovie: any) {
  const year = omdbMovie.Year ? parseInt(omdbMovie.Year.split('–')[0], 10) : null;
  let durationMinutes: number | null = null;
  if (omdbMovie.Runtime && omdbMovie.Runtime !== 'N/A') {
    const runtimeMatch = omdbMovie.Runtime.match(/(\d+)/);
    if (runtimeMatch) {
      durationMinutes = parseInt(runtimeMatch[1], 10);
    }
  }
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

async function getOrCreateCategory(slug: string, name: string) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const [newCategory] = await db
    .insert(categories)
    .values({ name, slug, description: null })
    .returning();
  return newCategory;
}

async function linkFilmToCategories(filmId: number, genres: string[]) {
  for (const genre of genres) {
    const categorySlug = genreToCategoryMap[genre] || genre.toLowerCase().replace(/\s+/g, '-');
    const categoryName = genre;
    try {
      const category = await getOrCreateCategory(categorySlug, categoryName);
      await db
        .insert(filmCategories)
        .values({ filmId, categoryId: category.id })
        .onConflictDoNothing();
    } catch (error) {
      console.error(`Erreur lors de la liaison du film ${filmId} à la catégorie ${genre}:`, error);
    }
  }
}

/**
 * Contrôleur pour gérer les routes de l'API OMDb
 */
export class OMDbController {
  /**
   * GET /omdb/search - Recherche de films via OMDb
   */
  static async search(req: Request, res: Response) {
    try {
      const { s: searchTerm, page, type, year } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre "s" (searchTerm) est requis',
        });
      }

      const result = await OMDbService.search(searchTerm, {
        page: page ? parseInt(page as string, 10) : undefined,
        type: type as 'movie' | 'series' | 'episode' | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error searching OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la recherche OMDb',
      });
    }
  }

  /**
   * GET /omdb/movie/:imdbId - Récupère les détails d'un film par ID IMDb
   */
  static async getByImdbId(req: Request, res: Response) {
    try {
      const { imdbId } = req.params;

      if (!imdbId) {
        return res.status(400).json({
          success: false,
          message: 'ID IMDb requis',
        });
      }

      const movie = await OMDbService.getByImdbId(imdbId);

      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      console.error('Error fetching movie from OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du film',
      });
    }
  }

  /**
   * GET /omdb/movie/title/:title - Récupère les détails d'un film par titre
   */
  static async getByTitle(req: Request, res: Response) {
    try {
      const { title } = req.params;
      const { year } = req.query;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Titre requis',
        });
      }

      const movie = await OMDbService.getByTitle(
        title,
        year ? parseInt(year as string, 10) : undefined
      );

      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      console.error('Error fetching movie from OMDb:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du film',
      });
    }
  }

  /**
   * POST /omdb/sync - Synchronise les films depuis OMDb vers la base de données
   */
  static async syncFilms(req: Request, res: Response) {
    try {
      const { count = 200 } = req.body;
      
      res.json({
        success: true,
        message: 'Synchronisation démarrée en arrière-plan',
      });

      // Exécuter la synchronisation en arrière-plan
      (async () => {
        try {
          console.log('🚀 Début de la synchronisation des films depuis OMDb...');
          const omdbMovies = await OMDbService.getPopularMovies(count);

          if (omdbMovies.length === 0) {
            console.log('❌ Aucun film récupéré depuis OMDb');
            return;
          }

          console.log(`📦 ${omdbMovies.length} films récupérés, insertion dans la base de données...`);

          let insertedCount = 0;
          let updatedCount = 0;
          let skippedCount = 0;

          for (const omdbMovie of omdbMovies) {
            try {
              const filmData = convertOMDbToFilm(omdbMovie);

              if (!filmData.posterUrl || filmData.posterUrl === 'N/A' || filmData.posterUrl === '') {
                skippedCount++;
                continue;
              }

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
                await db
                  .update(films)
                  .set({
                    ...filmData,
                    updatedAt: new Date(),
                  })
                  .where(eq(films.id, existing[0].id));

                if (omdbMovie.Genre) {
                  const genres = omdbMovie.Genre.split(',').map(g => g.trim());
                  await linkFilmToCategories(existing[0].id, genres);
                }

                updatedCount++;
              } else {
                const [newFilm] = await db
                  .insert(films)
                  .values(filmData)
                  .returning();

                if (omdbMovie.Genre) {
                  const genres = omdbMovie.Genre.split(',').map(g => g.trim());
                  await linkFilmToCategories(newFilm.id, genres);
                }

                insertedCount++;
              }
            } catch (error) {
              console.error(`❌ Erreur pour ${omdbMovie.Title}:`, error);
              skippedCount++;
            }
          }

          console.log(`✅ Synchronisation terminée !`);
          console.log(`   - ${insertedCount} films ajoutés`);
          console.log(`   - ${updatedCount} films mis à jour`);
          console.log(`   - ${skippedCount} films ignorés`);
        } catch (error) {
          console.error('❌ Erreur lors de la synchronisation:', error);
        }
      })();
    } catch (error) {
      console.error('Error starting sync:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du démarrage de la synchronisation',
      });
    }
  }
}
