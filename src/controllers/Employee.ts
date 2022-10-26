import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
const bcrypt = require('bcryptjs');

import mongoose from 'mongoose';
import Employee from '../models/Employee';

const createEmployee = (req: Request, res: Response, next: NextFunction) => {
    const { picture, name, position, managerId, myTasks, mySubordinates, email, password } = req.body;

    //first check that Employee with this email doesn't exist
    Employee.findOne({ email })
        .then((employee) => {
            if (employee) {
                return res.status(400).json({ error: 'Employee with this email already exists.' });
            }
            return bcrypt.hash(password, 10);
        })
        .then((hash) => {
            Employee.create({
                picture,
                name,
                position,
                managerId,
                myTasks,
                mySubordinates,
                email,
                password: hash
            })
                .then((employee) => {
                    return res.status(200).json({ employee });
                })
                .catch((err) => {
                    if (err.name === 'ValidationError') {
                        return res.status(400).json({ error: err.message });
                    }
                    return res.status(500).json({ error: 'Something went wrong.' });
                });
        })
        .catch((err) => {
            return res.status(500).json({ error: 'Something went wrong.' });
        });
};

const getEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;

    Employee.findById(employeeID)
        .then((employee) => (employee ? res.status(200).json(employee) : res.status(404).json({ message: 'Employee not found' })))
        .catch((err) => res.status(500).json(err));
};

const getAllEmployees = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Employee.find()
        .then((employees) => res.status(200).json(employees))
        .catch((err) => res.status(500).json(err));
};

const updateEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;
    const { picture, name, position, managerId, myTasks, mySubordinates, email, password } = req.body;

    Employee.findByIdAndUpdate(
        employeeID,
        {
            $set: {
                picture,
                name,
                position,
                managerId,
                myTasks,
                mySubordinates
            }
        },
        { runValidators: true, new: true }
    )
        .then((employee) => res.send(employee))
        .catch((err) => res.status(500).json(err));
};

const deleteEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;

    Employee.findByIdAndDelete(employeeID)
        .then((employee) => res.status(200).send({ deleted: employee }))
        .catch((err) => res.status(500).json(err));
};

export default { createEmployee, getEmployee, getAllEmployees, updateEmployee, deleteEmployee };
