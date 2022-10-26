import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import NotFoundError from '../errors/NotFoundError';
import Report, { IReport } from '../models/Report';

const getReportsForManager = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id;

    Report.find({ managerId })
        .orFail(() => {
            throw new NotFoundError('No reports found');
        })
        .then((reports: IReport[]) => res.status(200).json(reports))
        .catch(next);
};

export default { getReportsForManager };
