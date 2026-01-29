/**
 * Script pour mettre à jour les affiches manquantes des films depuis l'API OMDb
 * 
 * Usage: pnpm tsx apps/backend/src/scripts/update-missing-posters.ts
 */

import 'dotenv/config';
import { db, films, eq, isNull, or, sql } from '@cineconnect/database';
import { OMDbService } from '../services/omdb.service.js';

/**
 * Fonction principale pour mettre à jour les affiches manquantes
 */
async function updateMissingPosters() {
  try {
    console.log('🚀 Début de la mise à jour des affiches manquantes...\n');

    // Récupérer tous les films sans affiche
    const filmsWithoutPoster = await db
      .select()
      .from(films)
      .where(
        or(
          isNull(films.posterUrl),
          eq(films.posterUrl, ''),
          eq(films.posterUrl, 'N/A')
        )
      );

    if (filmsWithoutPoster.length === 0) {
      console.log('✅ Tous les films ont déjà une affiche !');
      return;
    }

    console.log(`📦 ${filmsWithoutPoster.length} films sans affiche trouvés\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const film of filmsWithoutPoster) {
      try {
        console.log(`🔍 Recherche de l'affiche pour: ${film.title}${film.releaseYear ? ` (${film.releaseYear})` : ''}...`);

        // Rechercher le film dans OMDb par titre et année
        let omdbMovie;
        try {
          omdbMovie = await OMDbService.getByTitle(film.title, film.releaseYear || undefined);
        } catch (error) {
          // Si la recherche par titre exact échoue, essayer une recherche plus large
          try {
            const searchResult = await OMDbService.search(film.title, {
              type: 'movie',
              year: film.releaseYear || undefined,
            });

            if (searchResult.Search && searchResult.Search.length > 0) {
              // Prendre le premier résultat qui correspond au titre
              const match = searchResult.Search.find(
                (m) => m.Title.toLowerCase() === film.title.toLowerCase()
              );
              if (match) {
                omdbMovie = await OMDbService.getByImdbId(match.imdbID);
              } else {
                // Prendre le premier résultat si aucun match exact
                omdbMovie = await OMDbService.getByImdbId(searchResult.Search[0].imdbID);
              }
            } else {
              throw new Error('Aucun résultat trouvé');
            }
          } catch (searchError) {
            throw error; // Relancer l'erreur originale
          }
        }

        // Vérifier si on a trouvé une affiche valide
        if (omdbMovie.Poster && omdbMovie.Poster !== 'N/A' && omdbMovie.Poster !== '') {
          // Mettre à jour le film avec l'affiche
          await db
            .update(films)
            .set({
              posterUrl: omdbMovie.Poster,
              updatedAt: new Date(),
            })
            .where(eq(films.id, film.id));

          updatedCount++;
          console.log(`  ✓ Affiche trouvée et mise à jour: ${omdbMovie.Poster.substring(0, 50)}...`);
        } else {
          notFoundCount++;
          console.log(`  ⊘ Aucune affiche trouvée pour ce film`);
        }

        // Ajouter un délai pour respecter les limites de l'API OMDb (1000 requêtes/jour en gratuit)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde entre chaque requête

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Erreur pour ${film.title}:`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`\n✅ Mise à jour terminée !`);
    console.log(`   - ${updatedCount} affiches mises à jour`);
    console.log(`   - ${notFoundCount} films sans affiche trouvée`);
    console.log(`   - ${errorCount} erreurs`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

// Exécuter le script
updateMissingPosters()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

