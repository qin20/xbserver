const app = require('../app');
const validators = require('../utils/validators');
const {UserResource, UserToday} = require('../models');
const db = require('../models/db');

/**
 * 购买tts资源包
 */
app.post('/account/add_resource', app.loginRequired, async (request) => {
    const {type, amounts} = request.body;
    validators.validateResource(type);

    if (type === 'tts') {
        validators.validateTTSAmounts(amounts);
        return await UserResource.addPayTTS(request.user.uid, amounts);
    }
});

/**
 * 签到
 */
app.post('/account/today', app.loginRequired, async (request) => {
    return await db.transaction(async () => {
        await UserToday.addToday(request.user.uid);
        const amounts = Math.floor(200 + Math.random() * 1800);
        const resource = await UserResource.addFreeTTS(
            request.user.uid, amounts,
        );
        return {msg: '签到成功', resource};
    });
});
