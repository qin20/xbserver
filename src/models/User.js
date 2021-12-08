const moment = require('moment');
const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('./db');
const {PointsError, TodayError, CodeOutDateError} = require('../utils/errors');

const User = class User extends Model {
    static async verifyPhoneToken(user, token) {
        const u = await User.findByPk(user.uid);
        const userToken = await UserToken.findByPk(user.uid);
        return !!(u && userToken && userToken.token === token);
    }

    static async logout(user) {
        const success = await UserToken.update({token: ''}, {where: {uid: user.uid}});
        return !!success;
    }

    static async getUserInfo(uid) {
        const user = await User.findByPk(uid, {raw: true});
        const resource = await UserResource.findByPk(uid, {raw: true});
        const token = await UserToken.findByPk(uid, {raw: true});
        const today = await UserToday.todayed(uid);

        return {
            uid: user.uid,
            phone: user.phone,
            pointsFree: resource.pointsFree,
            pointsPay: resource.pointsPay,
            token: token.token,
            today,
        };
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
        fields: ['phone'],
        unique: true,
    }],
});
User.sync({alter: true});

const UserToken = class UserToken extends Model {
    static async verifyPhoneToken(user, token) {
        const u = await UserToken.findByPk(user.uid, {attributes: ['token']});
        return u && u.token && u.token === token;
    }

    static async logout(user) {
        const success = await User.update({token: ''}, {where: {uid: user.uid}});
        return !!success;
    }
};
UserToken.init({
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
    token: {
        type: DataTypes.STRING(500),
        comment: 'jwt token',
    },
}, {
    comment: '用户token表',
    sequelize: db,
    indexes: [{
        fields: ['token'],
        unique: true,
    }],
});
UserToken.sync({alter: true});

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
     * 购买points
     */
    static async addPayPoints(uid, amounts) {
        const userResource = await UserResource.findOne({where: {uid}});
        return await userResource.update(
            {pointsPay: userResource.pointsPay + amounts},
        );
    }

    /**
     * 免费points
     */
    static async addFreePoints(uid, amounts) {
        const userResource = await UserResource.findOne({where: {uid}});
        return await userResource.update(
            {pointsFree: userResource.pointsFree + amounts},
        );
    }

    /**
     * 消费Points，优先消费免费Points
     */
    static async consumePoints(uid, amounts) {
        const userResource = await UserResource.findOne({where: {uid}});

        if (userResource.pointsFree === 0 && userResource.tssPay === 0) {
            throw new PointsError();
        }

        // 消费points数量
        const pointsFree = userResource.pointsFree - amounts;
        let pointsPay = userResource.pointsPay;
        if (pointsFree < 0) {
            pointsPay = pointsPay + pointsFree;
        }
        await userResource.update({
            pointsFree: pointsFree < 0 ? 0 : pointsFree,
            pointsPay: pointsPay < 0 ? 0 : pointsPay,
        });
        return userResource;
    }
}
UserResource.init({
    urid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'uid',
    },
    pointsPay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '购买的Points数量',
    },
    pointsFree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000,
        comment: '免费的Points数量',
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
    /**
     * 今天是否已经签到
     */
    static async todayed(uid, date) {
        date = date || moment().format('YYYY-MM-DD');
        const userToday = await UserToday.findOne({
            where: {uid, date},
        });
        return !!userToday;
    }

    static async addToday(uid) {
        const today = moment().format('YYYY-MM-DD');
        if (await UserToday.todayed(uid, today)) {
            throw new TodayError();
        } else {
            await UserToday.create({uid, date: today});
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
    UserToken,
};
