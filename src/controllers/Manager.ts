import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import Report from '../models/Report';

const getReportsForManager = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id!;

    Report.find({ managerId })
        .then((reports) => res.status(200).json(reports))
        .catch((err) => res.status(500).json(err));
};

export default { getReportsForManager };
