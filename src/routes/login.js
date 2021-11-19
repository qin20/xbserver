const {User} = require('../models');

module.exports = (fastify, options, done) => {
    fastify.get('/register', async (request, reply) => {
        const jane = await User.create({firstName1: 'Jane', lastName: 'Doe'});
        reply.send(jane);
    });

    done();
};
