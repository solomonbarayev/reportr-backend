const jwt = require('jsonwebtoken');
import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';

const auth = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }

    const token = authorization.replace('Bearer ', '');

    let payload = null;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }

    req.user = { _id: payload._id };

    return next();
};

export default auth;
