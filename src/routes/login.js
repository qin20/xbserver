const tencentcloud = require('../services/tencentcloud');
const {User, UserCode, UserToken, UserResource} = require('../models');
const db = require('../models/db');
const app = require('../app');
const validators = require('../utils/validators');
const {ClientParamsError} = require('../utils/errors');
const {serilizeIP} = require('../utils/ip');

app.post('/send_code', async (request) => {
    const body = request.body || {};
    const phone = body.phone;

    validators.validatePhone(phone);

    // 上一次发送的间隔时间不能小于60s
    const lastTime = await UserCode.getLastTimeFromNow(phone);
    if (lastTime && lastTime < 60) {
        throw new ClientParamsError('验证码发送过于频繁');
    }

    await db.transaction(async () => {
        const code = Math.random().toFixed(6).slice(-6);
        await UserCode.updateCode(phone, code);
        return await tencentcloud.sendMessageCode(phone, code);
    });
    return {msg: '发送成功'};
});

app.post('/phone_login', async (request, reply) => {
    const body = request.body || {};
    const phone = body.phone;
    const code = body.code;

    validators.validatePhone(phone);
    validators.validateVerifyCode(code);

    // 验证码是否有效
    const valid = await UserCode.verifyCode(phone, code);
    if (valid) {
        let user = await User.findOne({where: {phone}});

        return await db.transaction(async () => {
            if (!user) {
                user = await User.create({phone});
                await UserToken.create({uid: user.uid});
                await UserResource.create({uid: user.uid});
            }
            const {uid} = user.toJSON();
            const token = app.jwt.sign({
                uid: uid,
                ip: serilizeIP(request.ip),
            });
            await UserToken.update({token}, {where: {uid}});
            return {data: await User.getUserInfo(uid)};
        });
    } else {
        throw new ClientParamsError('验证码不正确');
    }
});

app.post('/logout', {
    preValidation: [app.authenticate],
}, async (request, reply) => {
    await User.logout(request.user);
    return {msg: '注销成功'};
});

app.get('/logined', {
    preValidation: [app.authenticate],
}, async (request, reply) => {
    return {msg: '登录成功'};
});
