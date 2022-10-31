import express from 'express';
import { IEmployee } from './employee.interface';
import employeeModel from './employees.model';
import managerModel from '../managers/managers.model';
import Controller from '../interfaces/controller.interface';
import { validateEmployee, validateObjectId } from '../middleware/validation.middleware';
import auth from '../middleware/auth.middleware';
import RequestWithUser from '../interfaces/requestWithUser.interface';
const bcrypt = require('bcryptjs');
import ConflictError from '../errors/ConflictError';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';

class EmployeeController implements Controller {
    public path = '/employees';
    public router = express.Router();

    private employees = employeeModel;
    private managers = managerModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(`${this.path}/myprofile`, auth, this.getCurrentLoggedInEmployee);
        this.router.get(`${this.path}/:id`, auth, validateObjectId, this.getEmployee);
        this.router.get(this.path, this.getAllEmployees);
        this.router.post(this.path, validateEmployee, this.createEmployee);
        this.router.get(`${this.path}/:id`, auth, validateObjectId, this.getEmployeeById);
    }

    private createEmployee = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        /* create employee function needs:
    1. check if email already exists
    2. hash password
    3. create employee
    4. check if this employee is manager and if so create manager
    5. if manager, update other employees who's ID are in this employee's mySubordinates array
    */
        // const employeeData: IEmployee = req.body;
        const { mySubordinates, ...employeeData } = req.body;
        const createdEmployee = new this.employees(employeeData);
        //check if employee already exists
        this.employees
            .findOne({ email: employeeData.email })
            .then((employee) => {
                if (employee) {
                    throw new ConflictError('Email already exists');
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
                            next(new BadRequestError(err.message));
                        } else {
                            next(err);
                        }
                    });
            })
            .catch(next);
    };

    private getAllEmployees = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.employees
            .find()
            .then((employees) => res.status(200).json(employees))
            .catch(next);
    };

    private getEmployeeById = (req: RequestWithUser, res: express.Response, next: express.NextFunction) => {
        const id = req.params.id;
        this.employees
            .findById(id)
            .then((employee) => {
                if (employee) {
                    res.send(employee);
                } else {
                    res.sendStatus(404);
                }
            })
            .catch(next);
    };

    private getCurrentLoggedInEmployee = (req: RequestWithUser, res: express.Response, next: express.NextFunction) => {
        const id = req.user!._id;
        this.employees
            .findById(id)
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
    private getEmployee = (req: RequestWithUser, res: express.Response, next: express.NextFunction) => {
        const id = req.params.id;
        console.log(id);

        this.employees
            .findById(id)
            .populate({ path: 'myTasks', select: 'title dueDate' })
            .populate({ path: 'managerId', select: 'firstName lastName position' })
            .then((employee) => {
                //1. check if employee exists
                if (!employee) {
                    throw new NotFoundError('Employee not found');
                } else {
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
                                    throw new NotFoundError('Manager not found');
                                } else {
                                    // if manager exits, return the employee and the manager's subordinates
                                    return res.status(200).json({ employeeInfo: employee, managerialInfo: manager });
                                }
                            })
                            .catch(next);
                    } else {
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
                    next(new BadRequestError(err.message));
                }
                console.log(err.message);
                return next(err.message);
            });
    };
}

export default EmployeeController;
