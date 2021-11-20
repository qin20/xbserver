/**
 * 普通错误
 */
class BaseError extends Error {
    constructor(err) {
        super(err);

        if (typeof err === 'string') {
            err = {msg: err};
        }
        const {status, msg, error, data} = {
            ...this.defaults,
            ...err,
        };
        this.status = status || 400;
        this.msg = msg || this.defaults.msg || '发生未知错误';
        this.error = error;
        this.data = data;
    }
}
exports.BaseError = BaseError;

/**
 * jwt认证错误
 */
exports.AuthenticateError = class AuthenticateError extends BaseError {
    get defaults() {
        return {
            msg: '请登录',
            status: 403,
            data: -2,
        };
    };
};

/**
 * 没有权限
 */
exports.NoPermissionError = class NoPermissionError extends BaseError {
    get defaults() {
        return {
            msg: '没有权限',
            status: 403,
        };
    };
};

/**
 * 请求参数错误
 */
exports.ClientParamsError = class ClientParamsError extends BaseError {
    get defaults() {
        return {
            msg: '参数错误',
        };
    };
};

/**
 * 请求参数错误
 */
exports.TTSError = class TTSError extends BaseError {
    get defaults() {
        return {
            status: 403,
            msg: '余额不足',
        };
    };
};

/**
 * 签到错误
 */
exports.TodayError = class TodayError extends BaseError {
    get defaults() {
        return {
            status: 400,
            msg: '你今天已经签到过了',
        };
    };
};
