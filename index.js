const app = require('./src/app');

// plugins
app.register(require('./src/plugins/db'));
require('./src/plugins/jwt');

// routers
require('./src/routes/login');

// 接口包装
app.setErrorHandler(require('./src/utils/errorsHandlers'));

app.listen(3000, function(err, address) {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
