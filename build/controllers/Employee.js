"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BasRequestError_1 = __importDefault(require("../errors/BasRequestError"));
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Manager_1 = __importDefault(require("../models/Manager"));
const Report_1 = __importDefault(require("../models/Report"));
const Task_1 = __importDefault(require("../models/Task"));
const bcrypt = require('bcryptjs');
const createEmployee = (req, res, next) => {
    /* create employee function needs:
    1. check if email already exists
    2. hash password
    3. create employee
    4. check if this employee is manager and if so create manager
    5. if manager, update other employees who's ID are in this employee's mySubordinates array
    */
    const { picture, firstName, lastName, position, myTasks, email, password, isManager, mySubordinates } = req.body;
    //first check that Employee with this email doesn't exist
    Employee_1.default.findOne({ email })
        .then((employee) => {
        if (employee) {
            throw new ConflictError_1.default('Email already exists');
        }
        return bcrypt.hash(password, 10);
    })
        .then((hash) => {
        Employee_1.default.create({
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
                Manager_1.default.create({
                    mySubordinates,
                    _id: employee._id
                })
                    .then((manager) => {
                    //update other employees who's ID are in this employee's mySubordinates array
                    if (manager.mySubordinates.length > 0) {
                        manager.mySubordinates.forEach((subordinateId) => {
                            Employee_1.default.findByIdAndUpdate(subordinateId, { managerId: manager._id }, { new: true })
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
                next(new BasRequestError_1.default(err.message));
            }
            else {
                next(err);
            }
        });
    })
        .catch(next);
};
const getCurrentLoggedInEmployee = (req, res, next) => {
    const employeeID = req.user._id;
    Employee_1.default.findById(employeeID)
        .then((employee) => {
        if (!employee) {
            throw new NotFoundError_1.default('Employee not found');
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
const getEmployee = (req, res, next) => {
    const employeeID = req.params.employeeID;
    Employee_1.default.findById({ _id: employeeID })
        .populate({ path: 'myTasks', select: 'title dueDate' })
        .populate({ path: 'managerId', select: 'firstName lastName position' })
        .then((employee) => {
        //1. check if employee exists
        if (!employee) {
            throw new NotFoundError_1.default('Employee not found');
        }
        else {
            //2. if employee exists, check if employee is manager
            if (employee.isManager) {
                //3. if employee is manager, return the employee and also return the manager's mySubordinates
                Manager_1.default.findById({ _id: employeeID })
                    .populate({ path: 'mySubordinates', select: 'firstName lastName position' })
                    .select('mySubordinates')
                    .then((manager) => {
                    // check if manager exists
                    if (!manager) {
                        throw new NotFoundError_1.default('Manager not found');
                    }
                    else {
                        //if manager exists, return the employee and also return the manager's mySubordinates
                        return res.status(200).json({ employeeInfo: employee, managerialInfo: manager });
                    }
                })
                    .catch(next);
            }
            else {
                //if employee is not manager, return the employee with task info populated, but no managerial info
                Employee_1.default.findById({ _id: employeeID })
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
            next(new BasRequestError_1.default('Invalid ID'));
        }
        return next(err);
    });
};
const getAllEmployees = (req, res, next) => {
    Employee_1.default.find()
        .then((employees) => res.status(200).json(employees))
        .catch(next);
};
const deleteAllEmployees = (req, res, next) => {
    Employee_1.default.deleteMany({})
        .then(() => {
        // also delete all tasks and reports
        Task_1.default.deleteMany({})
            .then(() => {
            Report_1.default.deleteMany({})
                .then(() => {
                // return res.status(200).json({ message: 'All employees, tasks and reports deleted' });
                //delete all managers
                Manager_1.default.deleteMany({})
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
exports.default = { createEmployee, getEmployee, getAllEmployees, getCurrentLoggedInEmployee, deleteAllEmployees };
