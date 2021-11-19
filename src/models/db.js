const {Sequelize} = require('sequelize');
const logger = require('../logger');

const sequelize = new Sequelize('xb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: logger.info.bind(logger),
});

module.exports = sequelize;
