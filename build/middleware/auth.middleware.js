"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const UnauthorizedError_1 = __importDefault(require("../errors/UnauthorizedError"));
const config_1 = require("../config/config");
const auth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedError_1.default('You must log in.');
    }
    const token = authorization.replace('Bearer ', '');
    let payload = null;
    try {
        payload = jwt.verify(token, config_1.config.jwtSecret);
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized. You must be logged in.' });
    }
    req.user = { _id: payload._id };
    return next();
};
exports.default = auth;
