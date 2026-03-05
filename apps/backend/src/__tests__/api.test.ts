// Test d'intégration : vérification des routes de l'API
// On teste que les routes répondent correctement

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../index.js'

describe('API - route health check', () => {

  it('GET /health devrait répondre avec un statut 200', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
  })

  it('GET / devrait retourner un message de bienvenue', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body.message).toContain('CinéConnect')
  })

})

describe('API - routes protégées sans token', () => {

  it('GET /api/friends sans token devrait retourner 401', async () => {
    const response = await request(app).get('/api/friends')

    expect(response.status).toBe(401)
  })

  it('GET /api/notifications sans token devrait retourner 401', async () => {
    const response = await request(app).get('/api/notifications')

    expect(response.status).toBe(401)
  })

  it('POST /api/friends/request/1 sans token devrait retourner 401', async () => {
    const response = await request(app).post('/api/friends/request/1')

    expect(response.status).toBe(401)
  })

})
