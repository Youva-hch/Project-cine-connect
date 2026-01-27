/**
 * Script pour supprimer les films sans affiche (poster_url NULL ou 'N/A')
 * 
 * Usage: pnpm tsx src/scripts/clean-films-without-poster.ts
 */

import 'dotenv/config';
import { db, films, filmCategories, reviews, eq, or, isNull, inArray } from '@cineconnect/database';

/**
 * Fonction principale
 */
async function cleanFilmsWithoutPoster() {
  try {
    console.log('🧹 Début du nettoyage des films sans affiche...\n');

    // Récupérer les films sans affiche
    const filmsWithoutPoster = await db
      .select()
      .from(films)
      .where(
        or(
          isNull(films.posterUrl),
          eq(films.posterUrl, 'N/A'),
          eq(films.posterUrl, '')
        )!
      );

    if (filmsWithoutPoster.length === 0) {
      console.log('✅ Aucun film sans affiche à supprimer');
      return;
    }

    console.log(`📋 ${filmsWithoutPoster.length} film(s) sans affiche trouvé(s) :\n`);
    filmsWithoutPoster.forEach((film) => {
      console.log(`  - ${film.title} (ID: ${film.id}, Année: ${film.releaseYear || 'N/A'})`);
    });

    // Supprimer les films sans affiche
    const filmIds = filmsWithoutPoster.map((f) => f.id);
    
    if (filmIds.length === 0) {
      console.log('✅ Aucun film à supprimer');
      return;
    }

    // D'abord, supprimer les relations dans film_categories
    console.log('\n🗑️  Suppression des relations film-catégories...');
    await db
      .delete(filmCategories)
      .where(inArray(filmCategories.filmId, filmIds));

    // Ensuite, supprimer les avis associés
    console.log('🗑️  Suppression des avis associés...');
    await db
      .delete(reviews)
      .where(inArray(reviews.filmId, filmIds));

    // Enfin, supprimer les films
    console.log('🗑️  Suppression des films...');
    const deletedFilms = await db
      .delete(films)
      .where(inArray(films.id, filmIds))
      .returning();

    console.log(`\n✅ ${deletedFilms.length} film(s) supprimé(s) avec succès !`);
    console.log('\n📊 Résumé :');
    console.log(`   - Films supprimés : ${deletedFilms.length}`);
    
    // Compter les films restants
    const remainingFilms = await db.select().from(films);
    console.log(`   - Films restants : ${remainingFilms.length}`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter le script
cleanFilmsWithoutPoster()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

