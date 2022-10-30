"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require('dotenv').config({ path: '../../.env' });
exports.config = {
    db: process.env.MONGO_DB || 'mongodb://localhost:27017/reportrDB',
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'secret'
};
