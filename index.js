const app = require('./src/app');

// plugins
app.register(require('./src/plugins/db'));
require('./src/plugins/jwt');

// routers
require('./src/routes/login');
require('./src/routes/account');
require('./src/routes/video');

// 接口包装
app.setErrorHandler(require('./src/utils/errorsHandlers'));
app.addHook('onSend', function(request, reply, payload, next) {
    if (reply.statusCode === 200 && typeof payload === 'string') {
        let pl;
        try {
            pl = JSON.parse(payload);
        } catch (e) {
            pl = {data: payload};
        }
        const newPayload = {...pl, code: pl.code || 0};
        next(null, JSON.stringify(newPayload));
    } else {
        next(null, payload);
    }
});

app.listen(32222, function(err, address) {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
