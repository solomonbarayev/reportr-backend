import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import BadRequestError from '../errors/BasRequestError';
import NotFoundError from '../errors/NotFoundError';

import Report from '../models/Report';
import Employee from '../models/Employee';

// export const createReport = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
//     //make controller to post the report
//     const { managerId, text, date } = req.body;

//     const employeeId = req.user!._id!;

//     //check if managerId is empoyeeId's manager
//     Employee.findById(employeeId)
//         .orFail(() => {
//             throw new NotFoundError('Employee not found');
//         })
//         .then((employee) => {
//             if (employee?.managerId?.toString() !== managerId) {
//                 throw new BadRequestError('You are not allowed to submit a report to this manager');
//             } else {
//                 const report = new Report({
//                     managerId,
//                     text,
//                     date,
//                     employeeId
//                 });

//                 report
//                     .save()
//                     .then((report) => {
//                         res.status(201).json({
//                             message: 'Report created successfully',
//                             report
//                         });
//                     })
//                     .catch(next);
//             }
//         })
//         .catch(next);
// };

export const createReport = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { text, date } = req.body;

    const employeeId = req.user!._id!;
    const managerId = req.params.managerId;

    console.log('maangerId', managerId);
    console.log('employeeId', employeeId);

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
                        //add report id to employee myReports array
                        Employee.updateOne({ _id: managerId }, { $push: { myReports: report._id } })
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

    Report.find({ managerId })
        .orFail(() => {
            throw new NotFoundError('Reports not found');
        })
        .then((reports) => res.status(200).json(reports))
        .catch((err) => res.status(500).json(err));
};

export const getReportsForCurrentUser = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const managerId = req.user!._id!;

    console.log(managerId); ///// returning id of logged in user

    Report.find({ managerId: managerId }) ////////////// check this!!!
        .then((reports) => {
            if (reports.length === 0) {
                console.log('here');
                throw new NotFoundError('no reports found for this user');
            }
            res.status(200).json(reports);
        })
        .catch((err) => res.status(500).json(err));
};

export const deleteAllReports = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Report.deleteMany({})
        .then((result) => {
            //delete all reports from employee myReports array
            Employee.updateMany({}, { $set: { myReports: [] } })
                .then((result) => res.status(200).json(result))
                .catch(next);

            res.status(200).json(result);
        })
        .catch(next);
};
