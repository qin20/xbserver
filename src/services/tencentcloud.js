// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs');
const {BaseError} = require('../utils/errors');
const app = require('../app');

const secretId = 'test';
const secretKey = 'test';

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

    app.log.info(`发送验证码: ${JSON.stringify(params)}`);

    let resp;
    let error;
    try {
        resp = await client.SendSms(params);
    } catch (e) {
        error = e;
    }

    if (!resp || !resp.SendStatusSet[0].SerialNo) {
        throw new BaseError({
            msg: '发送验证码失败',
            error: resp || error,
            status: 500,
        });
    }

    app.log.info(`发送验证码成功: ${JSON.stringify(resp)}`);

    return true;
}

async function tts(options) {
    const TtsClient = tencentcloud.tts.v20190823.Client;

    const client = new TtsClient({
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
    });
    const Volume = options.volumn && options.volumn / 10;
    const Speed = options.Speed && options.Speed / 100;
    const VoiceType = +options.voice;
    const Text = options.text;
    const SessionId = Text;
    const ModelType = 1;
    const params = {
        Volume,
        Speed,
        VoiceType,
        Text,
        SessionId,
        ModelType,
    };

    app.log.info(`合成腾讯语音: ${JSON.stringify(params)}`);

    let resp;
    let error;
    try {
        resp = await client.TextToVoice(params);
    } catch (e) {
        error = e;
    }

    if (!resp || !resp.Audio) {
        throw new BaseError({
            msg: '合成腾讯语音失败',
            error: resp || error,
            status: 500,
        });
    }

    const {Audio, ...info} = resp;
    app.log.info(`合成腾讯语音成功: ${JSON.stringify(info)}`);

    return true;
}

module.exports = {
    sendMessageCode,
    tts,
};
