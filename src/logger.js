const pino = require('pino');

const config = process.env.NODE_ENV === 'development' ? {
    level: 'debug',
    transport: {
        target: 'pino-pretty',
        // options: {destination: 'debug.log'},
    },
} : {
    level: 'error',
    redact: ['req.headers.authorization'],
    prettyPrint: true,
};

// const logFile = '/www/wwwlogs/api-server.log';
const logger = pino(config);

module.exports = logger;
