"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = __importDefault(require("../models/Task"));
const Employee_1 = __importDefault(require("../models/Employee"));
const mongoose_1 = __importDefault(require("mongoose"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const BasRequestError_1 = __importDefault(require("../errors/BasRequestError"));
const assignTask = (req, res, next) => {
    // first check if user exists
    Employee_1.default.findById(req.params.employeeID)
        .then((emp) => {
        var _a;
        if (!emp) {
            throw new NotFoundError_1.default('Employee not found');
        }
        if (((_a = emp === null || emp === void 0 ? void 0 : emp.managerId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user._id.toString()) {
            throw new BasRequestError_1.default('You are not allowed to assign tasks to this employee');
        }
        Task_1.default.create({
            ///////////////ISSUE HERE
            _id: new mongoose_1.default.Types.ObjectId(),
            title: req.body.title,
            dueDate: req.body.dueDate,
            managerId: req.user._id,
            employeeId: req.params.employeeID,
            assignDate: new Date().toISOString()
        })
            .then((response) => {
            Employee_1.default.updateOne({ _id: req.params.employeeID }, { $push: { myTasks: response._id } })
                .then((result) => res.status(201).json(result))
                .catch(next);
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
const getTasksForEmployee = (req, res, next) => {
    const { employeeID } = req.params;
    return Task_1.default.find({ employeeId: employeeID }).then((result) => {
        if (result) {
            res.status(200).json(result);
        }
        else {
            res.status(200).json({ message: 'No tasks found' });
        }
    });
};
const getAllTasks = (req, res, next) => {
    return Task_1.default.find()
        .then((result) => res.status(200).json(result))
        .catch(next);
};
const getCurrentUserTasks = (req, res, next) => {
    const employeeID = req.user._id;
    Employee_1.default.findById({ _id: employeeID })
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
            next(new BasRequestError_1.default('Invalid ID'));
        }
        return next(err);
    });
};
const deleteTask = (req, res, next) => {
    const { taskId } = req.params;
    Task_1.default.findByIdAndDelete({ _id: taskId })
        .then((result) => {
        if (result) {
            res.status(200).json({ message: 'Task deleted successfully', deleted: result });
        }
        else {
            throw new NotFoundError_1.default('Task not found');
        }
    })
        .catch((err) => {
        if (err.name === 'CastError') {
            next(new BasRequestError_1.default('Invalid ID'));
        }
        return next(err);
    });
};
exports.default = { assignTask, getTasksForEmployee, getAllTasks, getCurrentUserTasks, deleteTask };
