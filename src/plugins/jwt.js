const app = require('../app');
const {AuthenticateError} = require('../utils/errors');
const {User} = require('../models');

app.register(require('fastify-jwt'), {
    secret: 'bieyang-xiaobai_!^^%L',
    sign: {
        expiresIn: '1d',
    },
});

app.decorate('authenticate', async function(request, reply) {
    try {
        await request.jwtVerify();
        const token = request.headers['authorization'].replace('Bearer ', '');
        const valid = await User.verifyPhoneToken(request.user, token);
        if (!valid) {
            throw new new AuthenticateError();
        }
    } catch (err) {
        reply.send(new AuthenticateError({error: err}));
    }
});

app.decorate('loginRequired', {preValidation: [app.authenticate]});
