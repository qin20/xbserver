const app = require('./src/app');

// plugins
const db = require('./src/plugins/db');
app.register(db);

// routers
require('./src/routes/login');

app.listen(3000, function(err, address) {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
