const db = require('../models/db');

module.exports = async (fastify, options, done) => {
    try {
        await db.authenticate();
        fastify.log.info('Connection has been established successfully.');
    } catch (error) {
        done(`Unable to connect to the database: ${error}`);
    }
    done();
};
