const request = require('request');

async function tts(params) {
    return new Promise((resolve, reject) => {
        const api = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';
        const appkey = 'zyVeguUpc7uH0Te8';
        const token = 'b8f880cd84c14f119fd3775ce848c2c9';
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
                    reject(error);
                } else {
                    resolve(response);
                }
            }
        });
    });
}

module.exports = {
    tts,
};
