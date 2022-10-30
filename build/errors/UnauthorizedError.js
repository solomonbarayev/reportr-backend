"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Error } = require('./Error');
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}
exports.default = UnauthorizedError;
