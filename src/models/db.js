const {Sequelize} = require('sequelize');
const logger = require('../logger');

// sequelize auto transaction
// https://sequelize.org/master/manual/transactions.html
const cls = require('cls-hooked');
const namespace = cls.createNamespace('sequelize-transaction');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize('xb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: (msg, options) => {
        logger.info(msg.replace(/\?/g, () => {
            return `'${options.bind.shift()}'`;
        }));
    },
    timezone: '+08:00',
    define: {
        freezeTableName: true,
    },
});

module.exports = sequelize;
