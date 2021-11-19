module.exports = (fastify, options, done) => {
    fastify.get('/register', {
        preValidation: [fastify.authenticate],
    }, function(request, reply) {
        reply.send({hello: 'world'});
    });

    fastify.get('/register', {
        preValidation: [fastify.authenticate],
    }, function(request, reply) {
        reply.send({hello: 'world'});
    });
    done();
};
