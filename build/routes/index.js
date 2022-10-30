"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Employee_1 = __importDefault(require("./Employee"));
const Manager_1 = __importDefault(require("./Manager"));
const Task_1 = __importDefault(require("./Task"));
const Report_1 = __importDefault(require("./Report"));
const auth_1 = __importDefault(require("../middleware/auth"));
const Auth_1 = __importDefault(require("../controllers/Auth"));
const Employee_2 = __importDefault(require("../controllers/Employee"));
const validation_1 = require("../middleware/validation");
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const Employee_3 = __importDefault(require("../controllers/Employee"));
const router = express_1.default.Router();
router.post('/signup', validation_1.validateEmployee, Employee_2.default.createEmployee);
router.post('/signin', validation_1.validateAuthentication, Auth_1.default);
//get employees pre-auth for signup page
router.get('/employees', Employee_3.default.getAllEmployees);
router.use(auth_1.default);
router.use('/employees', Employee_1.default);
router.use('/managers', Manager_1.default);
router.use('/tasks', Task_1.default);
router.use('/reports', Report_1.default);
//non route
router.use('*', (req, res, next) => {
    throw new NotFoundError_1.default('Route not found');
});
exports.default = router;
