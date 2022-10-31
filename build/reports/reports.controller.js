"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reports_model_1 = __importDefault(require("./reports.model"));
const employees_model_1 = __importDefault(require("../employees/employees.model"));
const managers_model_1 = __importDefault(require("../managers/managers.model"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
class ReportController {
    constructor() {
        this.path = '/reports';
        this.router = express_1.default.Router();
        this.reports = reports_model_1.default;
        this.employees = employees_model_1.default;
        this.managers = managers_model_1.default;
        this.getReportsForUser = (req, res, next) => {
            const managerId = req.user._id;
            this.reports
                .find({ managerId })
                .populate({ path: 'employeeId', select: 'firstName lastName' })
                .select('date text employeeId')
                .then((reports) => {
                res.status(200).send(reports);
            })
                .catch(next);
        };
        this.createReport = (req, res, next) => {
            const { text, date } = req.body;
            const employeeId = req.user._id;
            const managerId = req.params.id;
            this.employees
                .findById({ _id: employeeId })
                .orFail(() => {
                throw new NotFoundError_1.default('Employee not found');
            })
                .then((employee) => {
                var _a;
                // make sure that only employee of manager can create report
                if (((_a = employee === null || employee === void 0 ? void 0 : employee.managerId) === null || _a === void 0 ? void 0 : _a.toString()) !== managerId.toString()) {
                    throw new BadRequestError_1.default('You are not authorized to create reports for this employee');
                }
                else {
                    this.reports
                        .create({
                        text,
                        date,
                        managerId,
                        employeeId
                    })
                        .then((report) => {
                        // add report id to manager's myReports array
                        this.managers
                            .updateOne({ _id: managerId }, { $push: { myReports: report._id } })
                            .then((result) => console.log(result))
                            .catch(next);
                        res.status(201).json({
                            message: 'Report created successfully',
                            report
                        });
                    })
                        .catch(next);
                }
            })
                .catch(next);
        };
        this.deleteReport = (req, res, next) => {
            const reportId = req.params.id;
            const managerId = req.user._id;
            this.reports
                .findByIdAndDelete({ _id: reportId, managerId })
                .orFail(() => {
                throw new NotFoundError_1.default('Report not found');
            })
                .then((report) => {
                // remove report id from manager's myReports array
                this.managers
                    .updateOne({ _id: managerId }, { $pull: { myReports: reportId } })
                    .then((result) => console.log(result))
                    .catch(next);
                res.status(200).json({
                    message: 'Report deleted successfully',
                    report
                });
            })
                .catch(next);
        };
        this.deleteAllReportsForUser = (req, res, next) => {
            const managerId = req.user._id;
            this.reports
                .deleteMany({ managerId })
                .then((result) => {
                //remove all reports from manager's myReports array
                this.managers
                    .updateOne({ _id: managerId }, { $set: { myReports: [] } })
                    .then((result) => console.log(result))
                    .catch(next);
                res.status(200).json({
                    message: 'All reports deleted successfully',
                    result
                });
            })
                .catch(next);
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/myreports`, auth_middleware_1.default, this.getReportsForUser);
        this.router.post(`${this.path}/:id`, auth_middleware_1.default, validation_middleware_1.validateReport, this.createReport);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.deleteReport);
        this.router.delete(`${this.path}`, auth_middleware_1.default, this.deleteAllReportsForUser);
    }
}
exports.default = ReportController;
