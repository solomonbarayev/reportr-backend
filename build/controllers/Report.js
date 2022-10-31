"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllReportsForUser = exports.deleteReport = exports.getReportsForUser = exports.createReport = void 0;
const BasRequestError_1 = __importDefault(require("../errors/BasRequestError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const Report_1 = __importDefault(require("../models/Report"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Manager_1 = __importDefault(require("../models/Manager"));
// to create report we need to:
// 1. check if managerId is empoyeeId's manager
// 2. create report
// 3. add report id to Managers myReports array
const createReport = (req, res, next) => {
    const { text, date } = req.body;
    const employeeId = req.user._id;
    const managerId = req.params.managerId;
    //check if managerId is empoyeeId's manager
    Employee_1.default.findById({ _id: employeeId })
        .orFail(() => {
        throw new NotFoundError_1.default('Employee not found');
    })
        .then((employee) => {
        var _a;
        if (((_a = employee === null || employee === void 0 ? void 0 : employee.managerId) === null || _a === void 0 ? void 0 : _a.toString()) !== managerId) {
            throw new BasRequestError_1.default('You are not allowed to submit a report to this manager');
        }
        else {
            Report_1.default.create({
                managerId,
                text,
                date,
                employeeId
            })
                .then((report) => {
                //add report id to manager's myReports array
                Manager_1.default.updateOne({ _id: managerId }, { $push: { myReports: report._id } })
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
exports.createReport = createReport;
const getReportsForUser = (req, res, next) => {
    //get reports for current user and populate employeeId firstName and lastName
    const managerId = req.user._id;
    Report_1.default.find({ managerId })
        .populate({ path: 'employeeId', select: 'firstName lastName' })
        .select('date text employeeId')
        .then((reports) => res.status(200).json(reports))
        .catch(next);
};
exports.getReportsForUser = getReportsForUser;
const deleteReport = (req, res, next) => {
    const reportId = req.params.reportId;
    const managerId = req.user._id;
    Report_1.default.findByIdAndDelete({ _id: reportId, managerId })
        .orFail(() => {
        throw new NotFoundError_1.default('Report not found');
    })
        .then((report) => {
        //remove report id from manager's myReports array
        Manager_1.default.updateOne({ _id: managerId }, { $pull: { myReports: reportId } })
            .then((result) => console.log(result))
            .catch(next);
        res.status(200).json({
            message: 'Report deleted successfully',
            report
        });
    })
        .catch(next);
};
exports.deleteReport = deleteReport;
const deleteAllReportsForUser = (req, res, next) => {
    const managerId = req.user._id;
    Report_1.default.deleteMany({ managerId })
        .then((result) => {
        //remove all report ids from manager's myReports array
        Manager_1.default.updateOne({ _id: managerId }, { $set: { myReports: [] } })
            .then((result) => console.log(result))
            .catch(next);
        res.status(200).json({
            message: 'All reports deleted successfully',
            result
        });
    })
        .catch(next);
};
exports.deleteAllReportsForUser = deleteAllReportsForUser;
