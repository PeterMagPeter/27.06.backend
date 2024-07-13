
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Doku',
      version: '1.0.0',
      description: 'API for ocean-combat webapplikation'
    },
    servers: [
      {
        url: 'http://localhost:3001',
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 100
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30
            },
            points: {
              type: 'integer',
              minimum: 0,
              maximum: 1000000
            },
            premium: {
              type: 'boolean'
            },
            level: {
              type: 'integer',
              minimum: 1,
              maximum: 1000
            },
            gameSound: {
              type: 'boolean'
            },
            music: {
              type: 'boolean'
            },
            higherLvlChallenge: {
              type: 'boolean'
            }
          },
          required: ['email', 'password', 'username']
        },
        Guest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30
            },
            points: {
              type: 'integer',
              minimum: 0,
              maximum: 1000000
            },
            level: {
              type: 'integer',
              minimum: 1,
              maximum: 1000
            },
            gameSound: {
              type: 'boolean'
            },
            music: {
              type: 'boolean'
            },
            higherLvlChallenge: {
              type: 'boolean'
            }
          },
          required: ['username']
        },
        OnlineMatch: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            roomId: {
              type: 'string'
            },
            privateMatch: {
              type: 'boolean'
            },
            gameMap: {
              type: 'string'
            },
            superWeapons: {
              type: 'boolean'
            },
            shotTimer: {
              type: 'integer',
              minimum: 1
            },
            gameMode: {
              type: 'string'
            },
            hostName: {
              type: 'string'
            },
            players: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            maxPlayers: {
              type: 'integer',
              minimum: 2,
              maximum: 16
            }
          },
          required: ['roomId', 'privateMatch', 'gameMap', 'superWeapons', 'shotTimer', 'gameMode', 'hostName', 'players', 'maxPlayers']
        }
      }
    }
  },
  apis: ['./dist/routes/*.js'] 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
export default swaggerDocs;