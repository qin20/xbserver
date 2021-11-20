const app = require('../app');
const {BaseError} = require('./errors');

const unkownErrorHandler = app.errorHandler;
module.exports = (error, request, reply) => {
    if (error instanceof BaseError) {
        const {defaults, ...filterError} = error;
        app.log.error(filterError);
        reply.status(error.status || 400).send({
            msg: error.msg, data: error.data,
        });
        return;
    }
    unkownErrorHandler(error, request, reply);
};
