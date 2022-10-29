import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import BadRequestError from '../errors/BasRequestError';
import NotFoundError from '../errors/NotFoundError';

import Report from '../models/Report';
import Employee from '../models/Employee';
import Manager from '../models/Manager';

// to create report we need to:
// 1. check if managerId is empoyeeId's manager
// 2. create report
// 3. add report id to Managers myReports array

export const createReport = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { text, date } = req.body;

    const employeeId = req.user!._id!;
    const managerId = req.params.managerId;

    //check if managerId is empoyeeId's manager
    Employee.findById({ _id: employeeId })
        .orFail(() => {
            throw new NotFoundError('Employee not found');
        })
        .then((employee) => {
            if (employee?.managerId?.toString() !== managerId) {
                throw new BadRequestError('You are not allowed to submit a report to this manager');
            } else {
                Report.create({
                    managerId,
                    text,
                    date,
                    employeeId
                })
                    .then((report) => {
                        //add report id to manager's myReports array
                        Manager.updateOne({ _id: managerId }, { $push: { myReports: report._id } })
                            .then((result) => console.log(result))
                            .catch(next);

                        res.status(201).json({
                            message: 'Report created successfully',
                            report
                        });
                    })
                    .catch(next);
            }
        })
        .catch(next);
};

export const getReportsForUser = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id!;
    Manager.findById(managerId)
        .populate('myReports')
        .select('myReports')
        .orFail(() => {
            throw new NotFoundError('Reports not found');
        })
        .then((reports) => res.status(200).json(reports))
        .catch(next);
};
