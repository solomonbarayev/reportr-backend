"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const app_1 = __importDefault(require("./app"));
const employees_controller_1 = __importDefault(require("./employees/employees.controller"));
const authentication_controller_1 = __importDefault(require("./authentication/authentication.controller"));
const tasks_controller_1 = __importDefault(require("./tasks/tasks.controller"));
const reports_controller_1 = __importDefault(require("./reports/reports.controller"));
const controllers = [new employees_controller_1.default(), new authentication_controller_1.default(), new tasks_controller_1.default(), new reports_controller_1.default()];
const app = new app_1.default(controllers, config_1.config.port);
app.connectToDatabaseAndListen();
