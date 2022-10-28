import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import BadRequestError from '../errors/BasRequestError';
import ConflictError from '../errors/ConflictError';
import NotFoundError from '../errors/NotFoundError';
import Employee from '../models/Employee';

const bcrypt = require('bcryptjs');

const createEmployee = (req: Request, res: Response, next: NextFunction) => {
    /* create employee function needs:
    1. check if email already exists
    2. hash password
    3. create employee
    4. update other employees who's ID are in this employee's mySubordinates array
    */
    const { picture, firstName, lastName, position, managerId, myTasks, mySubordinates, email, password, isManager } = req.body;

    //first check that Employee with this email doesn't exist
    Employee.findOne({ email })
        .then((employee) => {
            if (employee) {
                throw new ConflictError('Email already exists');
            }
            return bcrypt.hash(password, 10);
        })
        .then((hash) => {
            Employee.create({
                picture,
                firstName,
                lastName,
                position,
                managerId,
                myTasks,
                mySubordinates,
                email,
                password: hash,
                isManager
            })
                //update other employees who's ID are in this employee's mySubordinates array
                .then((employee) => {
                    if (employee.mySubordinates.length > 0) {
                        employee.mySubordinates.forEach((subordinateId) => {
                            Employee.findByIdAndUpdate(subordinateId, { managerId: employee._id }, { new: true })
                                .then((subordinate) => {
                                    console.log(subordinate);
                                })
                                .catch(next);
                        });
                    }
                    return res.status(200).json({ employee });
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

const getMyEmployeeProfile = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.user!._id;

    Employee.findById(employeeID)
        .then((employee) => {
            if (!employee) {
                throw new NotFoundError('Employee not found');
            }
            return res.status(200).json(employee);
        })
        .catch(next);
};

const getEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;

    Employee.findById({ _id: employeeID })
        .populate({ path: 'managerId', select: 'firstName lastName' })
        .populate({ path: 'mySubordinates', select: 'firstName lastName position' })
        .populate({ path: 'myTasks', select: 'title dueDate' })
        .then((employee) => {
            if (!employee) {
                throw new NotFoundError('Employee not found');
            } else {
                return res.status(200).json(employee);
            }
        })
        .catch((err) => {
            if (err.name === 'CastError') {
                next(new BadRequestError('Invalid ID'));
            }
            return next(err);
        });
};

const getAllEmployees = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Employee.find()
        .then((employees) => res.status(200).json(employees))
        .catch(next);
};

const updateEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;
    const { picture, firstName, lastName, position, managerId, myTasks, mySubordinates } = req.body;

    Employee.findByIdAndUpdate(
        employeeID,
        {
            $set: {
                picture,
                firstName,
                lastName,
                position,
                managerId,
                myTasks,
                mySubordinates
            }
        },
        { runValidators: true, new: true }
    )
        .orFail(() => {
            throw new NotFoundError('Employee not found');
        })
        .then((employee) => res.status(200).send(employee))
        .catch(next);
};

const deleteEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;

    Employee.findByIdAndDelete(employeeID)
        .orFail(() => {
            throw new NotFoundError('Employee not found');
        })
        .then((employee) => res.status(200).send({ deleted: employee }))
        .catch(next);
};

const deleteAllEmployees = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Employee.deleteMany({})
        .then(() => res.status(200).send({ deleted: 'All employees' }))
        .catch(next);
};

export default { createEmployee, getEmployee, getAllEmployees, getMyEmployeeProfile, updateEmployee, deleteEmployee, deleteAllEmployees };
