const request = require('request');
const logger = require('../logger');

function tts(params) {
    const api = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';
    const appkey = '123';
    const token = '123';
    const query = new URLSearchParams({
        appkey,
        token,
        format: 'wav',
        sample_rate: 44100,
        ...params,
    });
    const url = `${api}?${query.toString()}`;

    request({
        url,
        method: 'GET',
        encoding: null,
    }, function(error, response, body) {
        if (error != null) {
            debug(error);
            task.reject(error);
            reject(error);
        } else {
            const contentType = response.headers['content-type'];
            if (contentType === undefined || contentType != 'audio/mpeg') {
                let error;
                try {
                    error = JSON.parse(body.toString());
                } catch (e) {
                    error = body.toString();
                }
                debug(error);
                task.reject(error);
                reject(error);
            } else {
                task.resolve(body);
                resolve(body);
            }
        }
    });
}

module.exports = {
    tts,
};
