"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Task_1 = __importDefault(require("../controllers/Task"));
const validation_1 = require("../middleware/validation");
const { assignTask, getTasksForEmployee, getCurrentUserTasks, getAllTasks } = Task_1.default;
const router = express_1.default.Router();
router.get('/');
router.get('/mytasks', getCurrentUserTasks);
router.post('/:employeeID', validation_1.validateObjectId, validation_1.validateTask, assignTask);
router.get('/:employeeID', validation_1.validateObjectId, getTasksForEmployee);
router.get('/', getAllTasks);
exports.default = router;
