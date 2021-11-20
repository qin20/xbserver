const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('./db');

const User = class User extends Model {
    static async verifyPhoneToken(user, token) {
        const u = await User.findByPk(user.uid, {attributes: ['token']});
        return u && u.token && u.token === token;
    }

    static async logout(user) {
        const success = await User.update({token: ''}, {where: {uid: user.uid}});
        return !!success;
    }
};
User.init({
    uid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'user_id',
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '手机号码',
    },
    token: {
        type: DataTypes.STRING(500),
        comment: 'jwt token',
    },
    lastLogin: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
        comment: '最后登录时间',
    },
}, {
    comment: '用户表',
    sequelize: db,
    indexes: [{
        fields: ['token'],
    }, {
        fields: ['phone'],
        unique: true,
    }],
});
User.sync({alter: true});

const UserCode = class UserCode extends Model {
    /**
     * 更新用户验证码
     */
    static async updateCode(phone, code) {
        const userCode = await UserCode.findOne({where: {phone}});
        if (userCode) {
            userCode.update({code});
        } else {
            UserCode.create({phone, code});
        }
    }

    /**
     * 获取上一个验证码间隔时间
     */
    static async getLastTimeFromNow(phone) {
        const userCode = await UserCode.findOne({
            attributes: [
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('createdAt')), 'createdAt'],
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.fn('CURRENT_TIMESTAMP')), 'now'],
            ],
            where: {phone},
            raw: true,
        });

        // 上一次发送的间隔时间
        return userCode
            ? userCode.now - userCode.createdAt
            : 0;
    }

    /**
     * 校验验证码
     * @param {*} phone
     * @param {*} code
     */
    static async verifyCode(phone, code) {
        return true;
        const userCode = await UserCode.findOne({
            attributes: [
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('createdAt')), 'createdAt'],
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.fn('CURRENT_TIMESTAMP')), 'now'],
            ],
            where: {phone, code},
        });

        // 上一次发送的间隔时间
        if (userCode) {
            return userCode.now - userCode.createdAt < 60;
        }
        return false;
    }
};
UserCode.init({
    ucid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '手机号码',
    },
    code: {
        type: DataTypes.STRING(6),
        allowNull: false,
        comment: '验证码',
    },
}, {
    indexes: [{
        fields: ['phone'],
        unique: true,
    }],
    sequelize: db,
    comment: '手机验证码',
});
UserCode.sync({alter: true});

class UserVip extends Model {}
UserVip.init({
    uvid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'uid',
    },
}, {
    indexes: [{
        fields: ['uid'],
        unique: true,
    }],
    sequelize: db,
    comment: '用户验证码',
});
UserVip.sync({alter: true});

module.exports = {
    User,
    UserCode,
};
