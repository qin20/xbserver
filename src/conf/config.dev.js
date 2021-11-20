const CommonConfig = require('./config.common');

module.exports = class DevConfig {
    db = {
        user: '',
        password: '',
        database: '',
        port: '',
    };
};
