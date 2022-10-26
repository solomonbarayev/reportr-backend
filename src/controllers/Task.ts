import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import Task from '../models/Task';

import mongoose from 'mongoose';

const assignTask = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    //make controller to post the task
    const { title, description, status } = req.body;

    const managerId = req.user!._id;
    const employeeId = req.params.employeeId;

    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title,
        description,
        status,
        managerId,
        employeeId
    });

    return task
        .save()
        .then((result) => res.status(201).json(result))
        .catch((err) => res.status(500).json(err));
};

const getTasks = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { employeeId } = req.params;

    return Task.find({ employeeId })
        .then((result) => res.status(200).json(result))
        .catch((err) => res.status(500).json(err));
};

export default { assignTask, getTasks };
