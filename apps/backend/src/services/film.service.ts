import {
  db,
  films,
  categories,
  filmCategories,
  reviews,
  eq,
  and,
  or,
  like,
  desc,
  sql,
  inArray,
  gte,
  lte,
} from '@cineconnect/database';
import type { NewFilm } from '@cineconnect/database';

export interface FilmQueryParams {
  search?: string;
  category?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  page?: number;
  limit?: number;
}

export interface FilmsListResult {
  data: typeof films.$inferSelect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class FilmService {
  /**
   * Récupère tous les films avec filtres optionnels et pagination
   */
  static async getAllFilms(params: FilmQueryParams = {}): Promise<FilmsListResult> {
    const {
      search,
      category,
      year,
      yearMin,
      yearMax,
      ratingMin,
      ratingMax,
      page = 1,
      limit = 20,
    } = params;
    const offset = (page - 1) * limit;

    const conditions: (ReturnType<typeof eq> | ReturnType<typeof inArray> | ReturnType<typeof gte> | ReturnType<typeof lte> | ReturnType<typeof or>)[] = [];

    // Filtre par catégorie
    if (category) {
      const categoryFilms = await db
        .select({ filmId: filmCategories.filmId })
        .from(filmCategories)
        .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
        .where(eq(categories.slug, category));

      const filmIds = categoryFilms.map((cf) => cf.filmId);

      if (filmIds.length === 0) {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }

      conditions.push(inArray(films.id, filmIds));
    }

    // Filtre par année (exacte ou fourchette)
    if (year != null) {
      conditions.push(eq(films.releaseYear, year));
    } else {
      if (yearMin != null) conditions.push(gte(films.releaseYear, yearMin));
      if (yearMax != null) conditions.push(lte(films.releaseYear, yearMax));
    }

    // Filtre par note moyenne
    if (ratingMin != null) conditions.push(gte(films.ratingAverage, String(ratingMin)));
    if (ratingMax != null) conditions.push(lte(films.ratingAverage, String(ratingMax)));

    // Filtre par recherche (titre ou description)
    if (search) {
      conditions.push(
        or(
          like(films.title, `%${search}%`),
          like(sql`COALESCE(${films.description}, '')`, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(films);
    const countResult = await (whereClause
      ? countQuery.where(whereClause)
      : countQuery);
    const total = Number(countResult[0]?.count ?? 0);

    const dataQuery = db
      .select()
      .from(films)
      .orderBy(desc(films.ratingAverage))
      .limit(limit)
      .offset(offset);
    const data = await (whereClause ? dataQuery.where(whereClause) : dataQuery);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  /**
   * Récupère un film par son ID (avec catégories)
   */
  static async getFilmById(id: number) {
    const [film] = await db.select().from(films).where(eq(films.id, id)).limit(1);
    if (!film) return null;

    const filmCats = await db
      .select({
        categoryId: filmCategories.categoryId,
        name: categories.name,
        slug: categories.slug,
      })
      .from(filmCategories)
      .innerJoin(categories, eq(filmCategories.categoryId, categories.id))
      .where(eq(filmCategories.filmId, id));

    return { ...film, categories: filmCats };
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

  /**
   * Crée un film (admin)
   */
  static async createFilm(data: {
    title: string;
    description?: string | null;
    director?: string | null;
    releaseYear?: number | null;
    durationMinutes?: number | null;
    posterUrl?: string | null;
    categoryIds?: number[];
  }) {
    const { categoryIds, ...filmData } = data;
    const [inserted] = await db
      .insert(films)
      .values({
        ...filmData,
        ratingAverage: '0.00',
        ratingCount: 0,
      } as NewFilm)
      .returning();

    if (!inserted) return null;

    if (categoryIds?.length) {
      await db.insert(filmCategories).values(
        categoryIds.map((categoryId) => ({
          filmId: inserted.id,
          categoryId,
        }))
      );
    }

    return inserted;
  }

  /**
   * Met à jour un film (admin)
   */
  static async updateFilm(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      director: string | null;
      releaseYear: number | null;
      durationMinutes: number | null;
      posterUrl: string | null;
      categoryIds: number[];
    }>
  ) {
    const { categoryIds, ...filmData } = data;

    const [updated] = await db
      .update(films)
      .set({ ...filmData, updatedAt: new Date() })
      .where(eq(films.id, id))
      .returning();

    if (!updated) return null;

    if (categoryIds !== undefined) {
      await db.delete(filmCategories).where(eq(filmCategories.filmId, id));
      if (categoryIds.length > 0) {
        await db.insert(filmCategories).values(
          categoryIds.map((categoryId) => ({ filmId: id, categoryId }))
        );
      }
    }

    return updated;
  }

  /**
   * Supprime un film (admin)
   */
  static async deleteFilm(id: number) {
    const [deleted] = await db.delete(films).where(eq(films.id, id)).returning({ id: films.id });
    return deleted != null;
  }
}

