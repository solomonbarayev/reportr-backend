import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import Task from '../models/Task';

import mongoose from 'mongoose';
import NotFoundError from '../errors/NotFoundError';

const assignTask = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    //make controller to post the task
    const { title, dueDate } = req.body;

    const managerId = req.user!._id;
    const employeeID = req.params.employeeID;

    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title,
        dueDate,
        managerId,
        employeeID
    });

    return task
        .save()
        .then((result) => res.status(201).json(result))
        .catch(next);
};

const getTasks = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { employeeID } = req.params;

    return Task.find({ employeeID })
        .orFail(() => {
            throw new NotFoundError('No tasks found');
        })
        .then((result) => res.status(200).json(result))
        .catch(next);
};

const getAllTasks = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    return Task.find()
        .then((result) => res.status(200).json(result))
        .catch(next);
};

export default { assignTask, getTasks, getAllTasks };
