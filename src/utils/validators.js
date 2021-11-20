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

module.exports = {
    validatePhone,
    validateVerifyCode,
};
