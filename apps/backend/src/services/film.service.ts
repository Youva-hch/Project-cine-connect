import { db, films, categories, filmCategories, reviews, eq, and, or, like, desc, sql, inArray } from '@cineconnect/database';

export interface FilmQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export class FilmService {
  /**
   * Récupère tous les films avec filtres optionnels
   */
  static async getAllFilms(params: FilmQueryParams = {}) {
    const { search, category, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let conditions: any[] = [];

    // Filtre par catégorie
    if (category) {
      const categoryFilms = await db
        .select({ filmId: filmCategories.filmId })
        .from(filmCategories)
        .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
        .where(eq(categories.slug, category));

      const filmIds = categoryFilms.map((cf) => cf.filmId);

      if (filmIds.length === 0) {
        // Aucun film dans cette catégorie
        return [];
      }

      conditions.push(inArray(films.id, filmIds));
    }

    // Filtre par recherche (titre ou description)
    if (search) {
      conditions.push(
        or(
          like(films.title, `%${search}%`),
          like(sql`COALESCE(${films.description}, '')`, `%${search}%`)
        )!
      );
    }

    // Construire la requête
    let query = db.select().from(films);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Ajouter pagination et tri
    const allFilms = await query
      .orderBy(desc(films.ratingAverage))
      .limit(limit)
      .offset(offset);

    return allFilms;
  }

  /**
   * Récupère un film par son ID
   */
  static async getFilmById(id: number) {
    const [film] = await db.select().from(films).where(eq(films.id, id)).limit(1);
    return film || null;
  }

  /**
   * Récupère les films par catégorie
   */
  static async getFilmsByCategory(categorySlug: string) {
    const categoryFilms = await db
      .select({ filmId: filmCategories.filmId })
      .from(filmCategories)
      .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
      .where(eq(categories.slug, categorySlug));

    const filmIds = categoryFilms.map((cf) => cf.filmId);

    if (filmIds.length === 0) {
      return [];
    }

    return db
      .select()
      .from(films)
      .where(inArray(films.id, filmIds))
      .orderBy(desc(films.ratingAverage));
  }

  /**
   * Récupère toutes les catégories
   */
  static async getAllCategories() {
    return db.select().from(categories).orderBy(categories.name);
  }

  /**
   * Récupère les avis d'un film
   */
  static async getFilmReviews(filmId: number) {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.filmId, filmId))
      .orderBy(desc(reviews.createdAt));
  }
}

