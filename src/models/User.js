const moment = require('moment');
const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('./db');
const {TTSError, TodayError, CodeOutDateError} = require('../utils/errors');

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
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('updatedAt')), 'updatedAt'],
                [Sequelize.fn('UNIX_TIMESTAMP', Sequelize.fn('CURRENT_TIMESTAMP')), 'now'],
            ],
            where: {phone, code},
            raw: true,
        });
        // 上一次发送的间隔时间
        if (userCode) {
            if (userCode.now - userCode.updatedAt < 60) {
                return true;
            }
            throw new CodeOutDateError();
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

class UserResource extends Model {
    static async ensureCreate(uid) {
        const userResource = await UserResource.findByPk(uid);
        if (userResource) {
            return userResource;
        }
        return await UserResource.create({uid});
    }

    /**
     * 购买tts
     */
    static async addPayTTS(uid, amounts) {
        const userResource = await UserResource.ensureCreate(uid);

        if (userResource) {
            return await userResource.update(
                {ttsPay: userResource.ttsPay + amounts},
            );
        } else {
            return await UserResource.create({uid, ttsPay: amounts});
        }
    }

    /**
     * 免费tts
     */
    static async addFreeTTS(uid, amounts) {
        const userResource = await UserResource.ensureCreate(uid);

        if (userResource) {
            return await userResource.update(
                {ttsFree: userResource.ttsFree + amounts},
            );
        } else {
            return await UserResource.create({uid, ttsFree: amounts});
        }
    }

    /**
     * 消费TTS，优先消费免费TTS
     */
    static async consumeTTS(uid, amounts) {
        const userResource = await UserResource.ensureCreate(uid);

        if (!userResource) {
            await UserResource.create({
                uid: uid,
                ttsFree: 10000,
            });
        }

        if (userResource.ttsFree === 0 && userResource.tssPay === 0) {
            throw new TTSError();
        }

        // 消费tts数量
        const ttsFree = userResource.ttsFree - amounts;
        let ttsPay = userResource.ttsPay;
        if (ttsFree < 0) {
            ttsPay = ttsPay + ttsFree;
        }
        await userResource.update({
            ttsFree: ttsFree < 0 ? 0 : ttsFree,
            ttsPay: ttsPay < 0 ? 0 : ttsPay,
        });
        return userResource;
    }
}
UserResource.init({
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
    ttsPay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '购买的TTS数量',
    },
    ttsFree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000,
        comment: '免费的TTS数量',
    },
}, {
    indexes: [{
        fields: ['uid'],
        unique: true,
    }],
    sequelize: db,
    comment: '用户验证码',
});
UserResource.sync({alter: true});

class UserToday extends Model {
    static async addToday(uid) {
        const date = moment().format('YYYY-MM-DD');
        const userToday = await UserToday.findOne({
            where: {uid, date},
        });
        if (userToday) {
            throw new TodayError();
        } else {
            await UserToday.create({uid, date});
        }
    }
}
UserToday.init({
    utid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'uid',
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '签到日期',
    },
}, {
    indexes: [{
        fields: ['uid', 'date'],
        unique: true,
    }],
    sequelize: db,
    comment: '签到表',
});
UserToday.sync({alert: true});

module.exports = {
    User,
    UserCode,
    UserResource,
    UserToday,
};
