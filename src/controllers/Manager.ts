import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import Manager from '../models/Manager';

const getAllManagers = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Manager.find()
        .then((managers) => {
            return res.status(200).json(managers);
        })
        .catch((err) => {
            return next(err);
        });
};

export default { getAllManagers };
