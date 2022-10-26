import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import { config } from '../config/config';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import mongoose from 'mongoose';

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
                return res.status(200).json({ token });
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: 'Something went wrong.' });
        });
};

export default login;
