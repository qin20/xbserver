const pino = require('pino');

const config = process.env.NODE_ENV === 'development' ? {
    level: 'debug',
    transport: {
        target: 'pino-pretty',
    },
} : {
    level: 'error',
    file: '/www/wwwlogs/api-server.log',
    redact: ['req.headers.authorization'],
    prettyPrint: true,
};

const logger = pino(config);

module.exports = logger;
