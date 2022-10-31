"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tasks_model_1 = __importDefault(require("./tasks.model"));
const employees_model_1 = __importDefault(require("../employees/employees.model"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const validation_middleware_1 = require("../middleware/validation.middleware");
class TaskController {
    constructor() {
        this.path = '/tasks';
        this.router = express_1.default.Router();
        this.tasks = tasks_model_1.default;
        this.employees = employees_model_1.default;
        this.assignTask = (req, res, next) => {
            const employeeId = req.params.id;
            const taskData = req.body;
            //first check if employee exists
            this.employees
                .findById(employeeId)
                .then((employee) => {
                var _a;
                if (!employee) {
                    throw new NotFoundError_1.default('Employee not found');
                }
                // make sure that only manager can assign tasks
                if (((_a = employee === null || employee === void 0 ? void 0 : employee.managerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
                    throw new BadRequestError_1.default('You are not authorized to assign tasks to this employee');
                }
                //create task
                this.tasks
                    .create(Object.assign(Object.assign({}, taskData), { managerId: req.user._id, employeeId, assignDate: new Date().toISOString() }))
                    //now update employee's tasks
                    .then((task) => {
                    this.employees
                        .updateOne({ _id: employeeId }, { $push: { myTasks: task._id } })
                        .then((result) => console.log(result))
                        .catch(next);
                    res.status(201).json(task);
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
        this.getCurrentUserTasks = (req, res, next) => {
            const { _id } = req.user;
            this.employees
                .findById(_id)
                .populate({ path: 'myTasks', select: 'title dueDate' })
                .then((employee) => {
                if (!employee) {
                    throw new NotFoundError_1.default('Employee not found');
                }
                else {
                    return res.status(200).json(employee.myTasks);
                }
            })
                .catch((err) => {
                if (err.name === 'CastError') {
                    next(new BadRequestError_1.default('Invalid employee id'));
                }
                return next(err);
            });
        };
        this.getTasksForEmployee = (req, res, next) => {
            const employeeId = req.params.id;
            this.tasks
                .find({ employeeId })
                .then((tasks) => {
                if (tasks) {
                    return res.status(200).json(tasks);
                }
                else {
                    res.status(200).json({ message: 'No tasks found' });
                }
            })
                .catch((err) => {
                if (err.name === 'CastError') {
                    next(new BadRequestError_1.default('Invalid employee id'));
                }
                return next(err);
            });
        };
        this.deleteTask = (req, res, next) => {
            const taskId = req.params.id;
            this.tasks
                .findByIdAndDelete({ _id: taskId })
                .then((task) => {
                if (task) {
                    return res.status(200).json({ message: 'Task deleted successfully', delete: task });
                }
                else {
                    throw new NotFoundError_1.default('Task not found');
                }
            })
                .catch((err) => {
                if (err.name === 'CastError') {
                    next(new BadRequestError_1.default('Invalid task id'));
                }
                return next(err);
            });
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/mytasks`, auth_middleware_1.default, this.getCurrentUserTasks);
        this.router.post(`${this.path}/:id`, auth_middleware_1.default, validation_middleware_1.validateObjectId, validation_middleware_1.validateTask, this.assignTask);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.getTasksForEmployee);
        this.router.delete(`${this.path}/:id`, this.deleteTask);
    }
}
exports.default = TaskController;
