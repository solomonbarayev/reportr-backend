"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Report_1 = require("../controllers/Report");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/myreports', Report_1.getReportsForUser);
router.post('/:managerId', validation_1.validateReport, Report_1.createReport);
router.delete('/:reportId', Report_1.deleteReport);
router.delete('/', Report_1.deleteAllReportsForUser);
exports.default = router;
