"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Employee_1 = __importDefault(require("../controllers/Employee"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/myprofile', Employee_1.default.getCurrentLoggedInEmployee);
router.get('/:employeeID', validation_1.validateObjectId, Employee_1.default.getEmployee);
router.get('/', Employee_1.default.getAllEmployees);
router.delete('/', Employee_1.default.deleteAllEmployees);
exports.default = router;
