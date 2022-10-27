import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import Task from '../models/Task';
import Employee from '../models/Employee';

import mongoose from 'mongoose';
import NotFoundError from '../errors/NotFoundError';
import BadRequestError from '../errors/BasRequestError';
// import Employee from './Employee';

const assignTask = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    // first check if user exists

    console.log(req.body);
    console.log(req.user!._id);
    console.log(req.params.employeeID);

    Employee.findById(req.params.employeeID)
        .then((emp) => {
            if (!emp) {
                throw new NotFoundError('Employee not found');
            }

            Task.create({
                ///////////////ISSUE HERE
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                dueDate: req.body.dueDate,
                managerId: req.user!._id,
                employeeId: req.params.employeeID
            })
                .then((response) => {
                    Employee.updateOne({ _id: req.params.employeeID }, { $push: { myTasks: response._id } })
                        .then((result) => res.status(201).json(result))
                        .catch(next);
                })
                .catch((err) => {
                    if (err.name === 'ValidationError') {
                        next(new BadRequestError(err.message));
                    } else {
                        next(err);
                    }
                });
        })
        .catch(next);
};

const getTasks = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { employeeID } = req.params;

    return Task.find({ employeeId: employeeID }).then((result) => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json({ message: 'No tasks found' });
        }
    });
};

const getAllTasks = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    return Task.find()
        .then((result) => res.status(200).json(result))
        .catch(next);
};

const deleteTask = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    return Task.deleteOne({ _id: id })
        .then((result) => res.status(200).json(result))
        .catch(next);
};

export default { assignTask, getTasks, getAllTasks, deleteTask };
