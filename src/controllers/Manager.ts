import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import NotFoundError from '../errors/NotFoundError';
import Manager from '../models/Manager';
import Report, { IReport } from '../models/Report';

const getAllManagers = (req: Request, res: Response, next: NextFunction) => {
    Manager.find()
        .then((managers) => {
            return res.status(200).json(managers);
        })
        .catch((err) => {
            return next(err);
        });
};

const getReportsForManager = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id;

    Manager.findById(managerId)
        .populate('myReports')
        .orFail(() => {
            throw new NotFoundError('No reports found');
        })
        .then((manager) => res.status(200).json(manager))
        .catch(next);
};

export default { getReportsForManager, getAllManagers };
