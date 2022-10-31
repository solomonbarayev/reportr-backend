"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const errorHandler_middleware_1 = __importDefault(require("./middleware/errorHandler.middleware"));
const celebrate_1 = require("celebrate");
const Logging_1 = __importDefault(require("./library/Logging"));
const limiter_middleware_1 = require("./middleware/limiter.middleware");
const helmet_1 = __importDefault(require("helmet"));
const logger = require('./middleware/logger.middleware');
const cors = require('cors');
class App {
    constructor(controllers, port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeRequestLogging();
        this.initializeControllers(controllers);
        this.initializeErrorLogging();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use(cors());
        this.app.options('*', cors());
        this.app.use((0, helmet_1.default)());
        this.app.use(limiter_middleware_1.limiter);
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    initializeErrorHandling() {
        this.app.use((0, celebrate_1.errors)());
        this.app.use(errorHandler_middleware_1.default);
    }
    initializeErrorLogging() {
        this.app.use(logger.errorLogger);
    }
    initializeRequestLogging() {
        this.app.use(logger.requestLogger);
    }
    initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }
    connectToDatabaseAndListen() {
        mongoose_1.default
            .connect(config_1.config.db)
            .then(() => {
            Logging_1.default.info('Connected to MongoDB at: ' + config_1.config.db);
            this.listen();
        })
            .catch((err) => {
            Logging_1.default.error('Unable to connect: ');
            console.log(err);
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            Logging_1.default.info(`App listening on the port ${this.port}`);
        });
    }
}
exports.default = App;
