const Fastify = require('fastify');

const fastify = Fastify({
    logger: require('./logger'),
});

module.exports = fastify;
