"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
// import Logging from './library/Logging';
const Logging_1 = __importDefault(require("./library/Logging"));
const index_1 = __importDefault(require("./routes/index"));
const config_1 = require("./config/config");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const helmet_1 = __importDefault(require("helmet"));
const logger = require('./middleware/logger');
const cors = require('cors');
const { errors } = require('celebrate');
require('dotenv').config({ path: './.env' });
const router = (0, express_1.default)();
/** connect to mongo */
mongoose_1.default
    .connect(config_1.config.db)
    .then(() => {
    Logging_1.default.info('Connected to MongoDB');
    StartServer();
})
    .catch((err) => {
    Logging_1.default.error('Unable to connect: ');
    Logging_1.default.error(err);
});
router.use(cors());
router.options('*', cors());
router.use((0, helmet_1.default)());
// router.use(limiter);
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
router.use(logger.requestLogger);
// routes
router.use(index_1.default);
router.use(logger.errorLogger);
// central error handler
router.use(errors());
router.use(errorHandler_1.default);
/** only start server if mongo connects */
const StartServer = () => {
    const server = http_1.default.createServer(router);
    server.listen(config_1.config.port, () => {
        Logging_1.default.info(`Server started on port ${config_1.config.port}`);
    });
};
