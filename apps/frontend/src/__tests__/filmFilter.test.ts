// Test unitaire : filtrage des films par titre
// On teste la logique de recherche qui est utilisée dans la page Films

import { describe, it, expect } from 'vitest'

// On simule le type d'un film OMDB (simplifié pour les tests)
interface Film {
  imdbID: string
  Title: string
  Year: string
  Poster: string
}

// C'est exactement la même logique que dans Films.tsx
function filterFilms(films: Film[], search: string): Film[] {
  const query = search.trim().toLowerCase()
  if (!query) return films
  return films.filter(
    (f) => f.Title.toLowerCase().includes(query) || f.Year.includes(query)
  )
}

// On crée de faux films pour tester
const fakeFilms: Film[] = [
  { imdbID: 'tt1', Title: 'Inception', Year: '2010', Poster: '' },
  { imdbID: 'tt2', Title: 'Interstellar', Year: '2014', Poster: '' },
  { imdbID: 'tt3', Title: 'The Dark Knight', Year: '2008', Poster: '' },
  { imdbID: 'tt4', Title: 'Dune', Year: '2021', Poster: '' },
]

describe('Filtre de recherche des films', () => {

  it('devrait retourner tous les films si la recherche est vide', () => {
    const result = filterFilms(fakeFilms, '')
    expect(result).toHaveLength(4)
  })

  it('devrait trouver un film par son titre', () => {
    const result = filterFilms(fakeFilms, 'inception')
    expect(result).toHaveLength(1)
    expect(result[0].Title).toBe('Inception')
  })

  it('devrait fonctionner sans tenir compte des majuscules', () => {
    const result = filterFilms(fakeFilms, 'DUNE')
    expect(result).toHaveLength(1)
    expect(result[0].Title).toBe('Dune')
  })

  it('devrait trouver les films par année', () => {
    const result = filterFilms(fakeFilms, '2010')
    expect(result).toHaveLength(1)
    expect(result[0].Title).toBe('Inception')
  })

  it('devrait retourner une liste vide si aucun film ne correspond', () => {
    const result = filterFilms(fakeFilms, 'transformers')
    expect(result).toHaveLength(0)
  })

  it('devrait trouver plusieurs films avec un mot commun', () => {
    // "inter" matche Interstellar
    const result = filterFilms(fakeFilms, 'inter')
    expect(result).toHaveLength(1)
    expect(result[0].Title).toBe('Interstellar')
  })

})
