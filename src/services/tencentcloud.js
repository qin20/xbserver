// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs');
const {BaseError} = require('../utils/errors');
const app = require('../app');

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
    const phNumber = phoneNumber.startsWith('+86')
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

    app.log.info(`开始发送验证码: ${JSON.stringify(params)}`);
    const resp = await client.SendSms(params);

    if (!resp.SendStatusSet[0].SerialNo) {
        throw new BaseError({msg: '验证码发送失败', error: resp, status: 500});
    }

    return true;
}

async function tts(options) {
    const TtsClient = tencentcloud.tts.v20190823.Client;

    const clientConfig = {
        credential: {
            secretId,
            secretKey,
        },
        region: 'ap-guangzhou',
        profile: {
            httpProfile: {
                endpoint: 'tts.tencentcloudapi.com',
            },
        },
    };

    const client = new TtsClient(clientConfig);
    const Volume = options.volumn && options.volumn / 10;
    const Speed = options.Speed && options.Speed / 100;
    const VoiceType = options.voice;
    const Text = options.text;
    const params = {
        Volume,
        Speed,
        VoiceType,
        Text,
        'SessionId': Text,
    };

    return await client.TextToVoice(params);
}

module.exports = {
    sendMessageCode,
    tts,
};
