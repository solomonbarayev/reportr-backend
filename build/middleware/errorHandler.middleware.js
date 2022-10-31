"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'An error has occurred on the server' : err.message;
    res.status(statusCode).send({ message });
    next();
};
exports.default = errorHandler;
