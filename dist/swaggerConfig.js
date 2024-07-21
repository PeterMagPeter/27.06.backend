"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API - Doku',
            version: '1.0.0',
            description: 'API for ocean-combat web application'
        },
        servers: [
            {
                url: 'https://www.ocean-combat.com',
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'mongoId'
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
                            type: 'number',
                            minimum: 0,
                            maximum: 1
                        },
                        music: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1
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
                            format: 'mongoId'
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
                            type: 'number',
                            minimum: 0,
                            maximum: 1
                        },
                        music: {
                            type: 'number',
                            minimum: 0,
                            maximum: 1
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
                            format: 'mongoId'
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
    apis: ['src/routes/*.ts', 'dist/routes/*.js'] // Include both TypeScript and JavaScript files
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerDocs;
//# sourceMappingURL=swaggerConfig.js.map