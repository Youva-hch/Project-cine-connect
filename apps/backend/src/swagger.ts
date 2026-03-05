import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import type { Express } from 'express'

// Configuration de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CinéConnect API',
      version: '1.0.0',
      description: 'API de la plateforme CinéConnect — découvrir, noter et discuter autour des films',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu lors de la connexion',
        },
      },
    },
  },
  // Swagger va lire les commentaires dans ces fichiers pour générer la doc
  apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

// Fonction qui ajoute la route /api-docs à l'application Express
export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  console.log('📚 Swagger disponible sur http://localhost:3000/api-docs')
}
