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
        const data = await UserResource.addPayTTS(request.user.uid, amounts);
        return {msg: '购买成功', data};
    }
});

/**
 * 签到
 */
app.post('/account/today', app.loginRequired, async (request) => {
    return await db.transaction(async () => {
        await UserToday.addToday(request.user.uid);
        const amounts = Math.floor(500 + Math.random() * Math.random() * 1500);
        const data = await UserResource.addFreeTTS(
            request.user.uid, amounts,
        );
        app.log.info(`签到成功: 获得ttsFree: ${amounts}`);
        return {msg: '签到成功', data};
    });
});
