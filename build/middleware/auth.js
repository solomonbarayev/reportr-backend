"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    const token = authorization.replace('Bearer ', '');
    let payload = null;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    req.user = { _id: payload._id };
    return next();
};
exports.default = auth;
