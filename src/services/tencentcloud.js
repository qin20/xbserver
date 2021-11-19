// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs');

const secretId = 'AKIDnQntiFWWEfqkMhmZ5JGwLTKwHK6crpWw';
const secretKey = 'B4g15sNbYEcjY7PRBeqlOlrfCRQ8YhZA';

/**
 * 发送手机短信验证码
 */
async function sendMessageCode(phoneNumber, code) {
    const SmsClient = tencentcloud.sms.v20210111.Client;

    const clientConfig = {
        credential: {
            secretId,
            secretKey,
        },
        region: 'ap-guangzhou',
        profile: {
            httpProfile: {
                endpoint: 'sms.tencentcloudapi.com',
            },
        },
    };

    const client = new SmsClient(clientConfig);
    const phNumber = phoneNumber.startWith('+86')
        ? phoneNumber
        : `+86${phoneNumber}`;
    const params = {
        'PhoneNumberSet': [
            phNumber,
        ],
        'SmsSdkAppId': '1400598104',
        'SignName': '平南县别样传媒工作室',
        'TemplateId': '1207094',
        'TemplateParamSet': [
            code,
        ],
    };

    return await client.SendSms(params);
}

module.exports = {
    sendMessageCode,
};
