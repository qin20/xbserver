const pino = require('pino');

const config = process.env.NODE_ENV === 'production' ? {
    level: 'error',
    file: '/www/wwwlogs/api-server.log',
    redact: ['req.headers.authorization'],
    prettyPrint: true,
} : {
    level: 'debug',
    transport: {
        target: 'pino-pretty',
    },
};

const logger = pino(config);

module.exports = logger;
