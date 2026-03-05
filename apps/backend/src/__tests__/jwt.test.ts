// Test unitaire : vérification du système JWT
// On teste que les tokens JWT sont bien créés et vérifiés

import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'

const SECRET = 'your-secret-key'

describe('JWT - création et vérification de tokens', () => {

  it('devrait créer un token JWT sans erreur', () => {
    const token = jwt.sign({ userId: 1, email: 'test@test.com' }, SECRET)

    // Le token doit exister et être une chaîne de caractères
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('devrait contenir les bonnes informations dans le token', () => {
    const token = jwt.sign({ userId: 42, email: 'houche@test.com' }, SECRET)
    const decoded = jwt.verify(token, SECRET) as { userId: number; email: string }

    // Les données doivent être identiques à ce qu'on a mis dans le token
    expect(decoded.userId).toBe(42)
    expect(decoded.email).toBe('houche@test.com')
  })

  it('devrait rejeter un token invalide', () => {
    // Un faux token doit déclencher une erreur
    expect(() => {
      jwt.verify('ceci-nest-pas-un-token-valide', SECRET)
    }).toThrow()
  })

  it('devrait rejeter un token signé avec un mauvais secret', () => {
    const tokenAvecMauvaisSecret = jwt.sign({ userId: 1 }, 'mauvais-secret')

    expect(() => {
      jwt.verify(tokenAvecMauvaisSecret, SECRET)
    }).toThrow()
  })

})
