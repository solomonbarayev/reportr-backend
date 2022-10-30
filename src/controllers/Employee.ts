import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../definitions/definitions';
import BadRequestError from '../errors/BasRequestError';
import ConflictError from '../errors/ConflictError';
import NotFoundError from '../errors/NotFoundError';
import Employee, { IEmployee } from '../models/Employee';
import Manager from '../models/Manager';
import Report from '../models/Report';
import Task from '../models/Task';

const bcrypt = require('bcryptjs');

const createEmployee = (req: Request, res: Response, next: NextFunction) => {
    /* create employee function needs:
    1. check if email already exists
    2. hash password
    3. create employee
    4. check if this employee is manager and if so create manager
    5. if manager, update other employees who's ID are in this employee's mySubordinates array
    */
    const { picture, firstName, lastName, position, myTasks, email, password, isManager, mySubordinates } = req.body;

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
                myTasks,
                email,
                password: hash,
                isManager
            })
                //check if this employee is manager and if so create manager
                .then((employee) => {
                    if (employee.isManager) {
                        Manager.create({
                            mySubordinates,
                            _id: employee._id
                        })
                            .then((manager) => {
                                //update other employees who's ID are in this employee's mySubordinates array
                                if (manager.mySubordinates.length > 0) {
                                    manager.mySubordinates.forEach((subordinateId) => {
                                        Employee.findByIdAndUpdate(subordinateId, { managerId: manager._id }, { new: true })
                                            .then((subordinate) => {
                                                console.log(subordinate);
                                            })
                                            .catch(next);
                                    });
                                }
                            })
                            .catch(next);
                    }
                    return res.status(200).json(employee);
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

const getCurrentLoggedInEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
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

// getEmployee controller
//1. check if employee exists
//2. if employee exists, check if employee is manager
//3. if employee is manager, return the employee and also return the manager's mySubordinates
//4. if employee is not manager, return the employee
const getEmployee = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const employeeID = req.params.employeeID;

    Employee.findById({ _id: employeeID })
        .populate({ path: 'myTasks', select: 'title dueDate' })
        .populate({ path: 'managerId', select: 'firstName lastName position' })
        .then((employee) => {
            //1. check if employee exists
            if (!employee) {
                throw new NotFoundError('Employee not found');
            } else {
                //2. if employee exists, check if employee is manager
                if (employee.isManager) {
                    //3. if employee is manager, return the employee and also return the manager's mySubordinates
                    Manager.findById({ _id: employeeID })
                        .populate({ path: 'mySubordinates', select: 'firstName lastName position' })
                        .select('mySubordinates')
                        .then((manager) => {
                            // check if manager exists
                            if (!manager) {
                                throw new NotFoundError('Manager not found');
                            } else {
                                //if manager exists, return the employee and also return the manager's mySubordinates
                                return res.status(200).json({ employeeInfo: employee, managerialInfo: manager });
                            }
                        })
                        .catch(next);
                } else {
                    //if employee is not manager, return the employee with task info populated, but no managerial info
                    Employee.findById({ _id: employeeID })
                        .populate({ path: 'myTasks', select: 'title dueDate' })
                        .populate({ path: 'managerId', select: 'firstName lastName position' })
                        .then((employee) => {
                            return res.status(200).json({ employeeInfo: employee });
                        })
                        .catch(next);
                }
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

const deleteAllEmployees = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    Employee.deleteMany({})
        .then(() => {
            // also delete all tasks and reports
            Task.deleteMany({})
                .then(() => {
                    Report.deleteMany({})
                        .then(() => {
                            // return res.status(200).json({ message: 'All employees, tasks and reports deleted' });
                            //delete all managers
                            Manager.deleteMany({})
                                .then(() => {
                                    return res.status(200).json({ message: 'All employees, tasks, reports and managers deleted' });
                                })
                                .catch(next);
                        })
                        .catch(next);
                })
                .catch(next);
        })
        .catch(next);
};

export default { createEmployee, getEmployee, getAllEmployees, getCurrentLoggedInEmployee, deleteAllEmployees };
