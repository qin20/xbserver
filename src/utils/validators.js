/**
 * 表单验证，
 * 字段维度
 */
const {
    ClientParamsError,
} = require('../utils/errors');

/**
 * 手机号码
 * @param {string} phoneNumber
 * @param {object} options
 */
function validatePhone(phone, options) {
    options = {required: true, ...options};
    if (options.required && !phone) {
        throw new ClientParamsError('请输入手机号码');
    } else if (!/^\+861\d{10}$/.test(phone)) {
        throw new ClientParamsError('手机号码不正确');
    }
}

/**
 * 手机验证码
 * @param {string} code
 * @param {object} options
 */
function validateVerifyCode(code, options) {
    options = {required: true, ...options};
    if (options.required && !code) {
        throw new ClientParamsError('请输入验证码');
    } else if (!/^\d{6}$/.test(code)) {
        throw new ClientParamsError('验证码不正确');
    }
}

function validateTTSType(type) {
    if (!type) {
        throw new ClientParamsError('缺少参数[type]');
    }
    const valid = ['ali', 'ten'].indexOf(type) >= 0;
    if (!valid) {
        throw new ClientParamsError('参数[type]错误');
    }
}

function validateResource(type) {
    if (!type) {
        throw new ClientParamsError('缺少参数[type]');
    }
    const valid = ['tts'].indexOf(type) >= 0;
    if (!valid) {
        throw new ClientParamsError('参数[type]错误');
    }
}

function validatePointsAmounts(amounts) {
    if (!amounts) {
        throw new ClientParamsError('缺少参数[amounts]');
    }
    const valid = /\d+/.test(amounts);
    if (!valid) {
        throw new ClientParamsError('参数[amounts]错误');
    }
}

module.exports = {
    validatePhone,
    validateVerifyCode,
    validateTTSType,
    validateResource,
    validatePointsAmounts,
};
