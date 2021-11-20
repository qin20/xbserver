const {UserResource} = require('../models');
const app = require('../app');
const validators = require('../utils/validators');
const alicloud = require('../services/alicloud');
const tencentcloud = require('../services/tencentcloud');
const db = require('../models/db');

app.get('/tts', {preValidation: [app.authenticate]}, async (request) => {
    const {type, ...params} = request.query;
    validators.validateTTSType(type);

    return await db.transaction(async () => {
        await UserResource.consumeTTS(request.user.uid, params.text.length);
        if (type === 'ten') {
            return await tencentcloud.tts(params);
        } else if (type === 'ali') {
            return await alicloud.tts(params);
        }
    });
});
