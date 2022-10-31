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
const config_1 = require("../config/config");
const ConflictError_1 = __importDefault(require("../errors/ConflictError"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validation_middleware_1 = require("../middleware/validation.middleware");
const employees_model_1 = __importDefault(require("../employees/employees.model"));
const managers_model_1 = __importDefault(require("../managers/managers.model"));
class AuthenticationController {
    constructor() {
        this.path = '/auth';
        this.router = express_1.default.Router();
        this.employees = employees_model_1.default;
        this.managers = managers_model_1.default;
        this.login = (req, res, next) => {
            const { email, password } = req.body;
            return this.employees
                .findOne({ email })
                .select('+password')
                .then((user) => {
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }
                return bcrypt.compare(password, user.password).then((match) => {
                    if (!match) {
                        return res.status(401).json({ error: 'Invalid email or password.' });
                    }
                    const token = jwt.sign({ _id: user._id }, config_1.config.jwtSecret, { expiresIn: '7d' });
                    // make object from user with everything except password
                    const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
                    // return token and user without password
                    return res.status(200).json({ token, user: userWithoutPassword });
                });
            })
                .catch((err) => {
                return res.status(500).json({ error: 'Something went wrong. ' + err });
            });
        };
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
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/register`, validation_middleware_1.validateEmployee, this.createEmployee);
        this.router.post(`${this.path}/login`, validation_middleware_1.validateAuthentication, this.login);
    }
}
exports.default = AuthenticationController;
