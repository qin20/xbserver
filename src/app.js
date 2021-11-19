const Fastify = require('fastify');
const logger = require('./src/logger');

const fastify = Fastify({
    logger,
});

module.exports = fastify;
