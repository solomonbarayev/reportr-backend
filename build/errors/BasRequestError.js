"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Error } = require('./Error');
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}
exports.default = BadRequestError;
