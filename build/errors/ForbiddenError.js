"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Error } = require('./Error');
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
    }
}
exports.default = ForbiddenError;
