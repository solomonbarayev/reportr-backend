"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employees_model_1 = __importDefault(require("./employees.model"));
const managers_model_1 = __importDefault(require("../managers/managers.model"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const bcrypt = require('bcryptjs');
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
class EmployeeController {
    constructor() {
        this.path = '/employees';
        this.router = express_1.default.Router();
        this.employees = employees_model_1.default;
        this.managers = managers_model_1.default;
        this.createEmployee = (req, res, next) => {
            /* create employee function needs:
        1. check if email already exists
        2. hash password
        3. create employee
        4. check if this employee is manager and if so create manager
        5. if manager, update other employees who's ID are in this employee's mySubordinates array
        */
            // const employeeData: IEmployee = req.body;
            const _a = req.body, { mySubordinates } = _a, employeeData = __rest(_a, ["mySubordinates"]);
            const createdEmployee = new this.employees(employeeData);
            //check if employee already exists
            this.employees
                .findOne({ email: employeeData.email })
                .then((employee) => {
                if (employee) {
                    throw new ConflictError_1.default('Email already exists');
                }
                return bcrypt.hash(employeeData.password, 10);
            })
                .then((hash) => {
                createdEmployee.password = hash;
                createdEmployee
                    .save()
                    .then((savedEmployee) => {
                    //check if this employee is manager and if so create manager
                    if (savedEmployee.isManager) {
                        this.managers
                            .create({
                            mySubordinates,
                            _id: savedEmployee._id
                        })
                            .then((manager) => {
                            //update other employees who's ID are in this employee's mySubordinates array
                            if (manager.mySubordinates.length > 0) {
                                manager.mySubordinates.forEach((subordinateId) => {
                                    this.employees
                                        .findByIdAndUpdate(subordinateId, { managerId: manager._id }, { new: true })
                                        .then((subordinate) => {
                                        console.log(subordinate);
                                    })
                                        .catch(next);
                                });
                            }
                        })
                            .catch(next);
                    }
                    return res.status(201).send(savedEmployee);
                })
                    .catch((err) => {
                    if (err.name === 'ValidationError') {
                        next(new BadRequestError_1.default(err.message));
                    }
                    else {
                        next(err);
                    }
                });
            })
                .catch(next);
        };
        this.getAllEmployees = (req, res, next) => {
            this.employees
                .find()
                .then((employees) => res.status(200).json(employees))
                .catch(next);
        };
        this.getEmployeeById = (req, res, next) => {
            const id = req.params.id;
            this.employees
                .findById(id)
                .then((employee) => {
                if (employee) {
                    res.send(employee);
                }
                else {
                    res.sendStatus(404);
                }
            })
                .catch(next);
        };
        this.getCurrentLoggedInEmployee = (req, res, next) => {
            const id = req.user._id;
            this.employees
                .findById(id)
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
        this.getEmployee = (req, res, next) => {
            const id = req.params.id;
            console.log(id);
            this.employees
                .findById(id)
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
                        //3. if employee is manager, return the employee and also return the manager's subordinates
                        this.managers
                            .findById({ _id: id })
                            .populate({ path: 'mySubordinates', select: 'firstName lastName position' })
                            .select('mySubordinates')
                            .then((manager) => {
                            //check if manager exists
                            if (!manager) {
                                throw new NotFoundError_1.default('Manager not found');
                            }
                            else {
                                // if manager exits, return the employee and the manager's subordinates
                                return res.status(200).json({ employeeInfo: employee, managerialInfo: manager });
                            }
                        })
                            .catch(next);
                    }
                    else {
                        // if employee is not manager, return the employee with task info populated, but no managerial info
                        this.employees
                            .findById({ _id: id })
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
                console.log('here');
                if (err.name === 'CastError') {
                    next(new BadRequestError_1.default(err.message));
                }
                console.log(err.message);
                return next(err.message);
            });
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/myprofile`, auth_middleware_1.default, this.getCurrentLoggedInEmployee);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, validation_middleware_1.validateObjectId, this.getEmployee);
        this.router.get(this.path, this.getAllEmployees);
        this.router.post(this.path, validation_middleware_1.validateEmployee, this.createEmployee);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, validation_middleware_1.validateObjectId, this.getEmployeeById);
    }
}
exports.default = EmployeeController;
