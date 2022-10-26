import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import mongoose from 'mongoose';

import Employee from '../models/Employee';

// const login = (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body;

//     return Employee.findOne({ email })
//         .select('+password')
//         .then((user) => {
//             if (!user) {
//                 return res.status(401).json({ error: 'Invalid email or password.' });
//             }
//             return bcrypt.compare(password, user.password).then((match: boolean) => {
//                 if (!match) {
//                     return res.status(401).json({ error: 'Invalid email or password.' });
//                 }
//                 const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//                 return res.status(200).json({ token });
//             });
//         })
//         .catch((err) => {
//             return res.status(500).json({ error: 'Something went wrong.' });
//         });
// };

const login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    return Employee.findOne({ email })
        .select('+password')
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            bcrypt.compare(password, user.password, (err: any, match: boolean) => {
                if (match) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                    return res.status(200).json({ token });
                } else {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: 'Something went wrong.' });
        });
};

export default login;
