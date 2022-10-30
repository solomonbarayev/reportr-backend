"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Error } = require('./Error');
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}
exports.default = NotFoundError;
