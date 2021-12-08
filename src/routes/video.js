const {UserResource} = require('../models');
const app = require('../app');
const validators = require('../utils/validators');
const alicloud = require('../services/alicloud');
const tencentcloud = require('../services/tencentcloud');
const db = require('../models/db');

app.get('/tts', {logLevel: 'warn', preValidation: [app.authenticate]}, async (request, reply) => {
    const {api, ...params} = request.query;
    validators.validateTTSType(api);

    return await db.transaction(async () => {
        await UserResource.consumePoints(request.user.uid, params.text.length);
        let resp;
        if (api === 'ten') {
            resp = await tencentcloud.tts(params);
        } else if (api === 'ali') {
            resp = await alicloud.tts(params);
        }
        reply.type(resp.headers['content-type']);
        reply.header('content-length', resp.body.length);
        return resp.body;
    });
});
