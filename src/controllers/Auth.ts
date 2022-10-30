import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import Employee from '../models/Employee';

const login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    return Employee.findOne({ email })
        .select('+password')
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            return bcrypt.compare(password, user.password).then((match: boolean) => {
                if (!match) {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }
                const token = jwt.sign({ _id: user._id }, config.jwtSecret, { expiresIn: '7d' });
                // make object from user with everything except password
                const { password, ...userWithoutPassword } = user.toObject();
                // return token and user without password
                return res.status(200).json({ token, user: userWithoutPassword });
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: 'Something went wrong.' });
        });
};

export default login;
