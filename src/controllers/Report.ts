import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';

import Report from '../models/Report';
import Employee from '../models/Employee';

export const createReport = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    //make controller to post the report
    const { managerId, text, date } = req.body;

    const employeeId = req.user!._id!;

    //check if managerId is empoyeeId's manager
    Employee.findById(employeeId)
        .then((employee) => {
            if (employee?.managerId?.toString() !== managerId) {
                res.status(400).json({
                    message: 'You are not allowed to submit a report to this manager'
                });
            } else {
                const report = new Report({
                    managerId,
                    text,
                    date,
                    employeeId
                });

                report
                    .save()
                    .then((report) => {
                        res.status(201).json({
                            message: 'Report created successfully',
                            report
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: 'Error creating report',
                            error: err
                        });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: 'Error finding employee',
                error: err
            });
        });
};

export const getReportsForUser = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id!;

    Report.find({ managerId })
        .then((reports) => res.status(200).json(reports))
        .catch((err) => res.status(500).json(err));
};
