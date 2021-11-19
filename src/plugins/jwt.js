const jwt = require('fastify-jwt');

module.exports = (fastify, options, done) => {
    fastify.register(jwt, {
        secret: 'bieyang-xiaobai_!^^%L',
        expiresIn: '1d',
    });

    fastify.decorate('authenticate', async function(request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    done();
};
