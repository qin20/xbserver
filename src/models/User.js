const {DataTypes} = require('sequelize');
const db = require('./db');

const User = db.define('User', {
    // Model attributes are defined here
    firstName1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
    },
}, {
    // Other model options go here
    sequelize: db, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
    freezeTableName: true,
    tableName: 'User',
});

User.sync({alter: true});
