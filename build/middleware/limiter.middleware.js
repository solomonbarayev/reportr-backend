"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
exports.limiter = limiter;
