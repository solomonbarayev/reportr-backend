import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import Logging from './src/library/Logging';
import routes from './src/routes/index';
import { config } from './src/config/config';
import errorHandler from './src/middleware/errorHandler';
import { limiter } from './src/middleware/limiter';
import helmet from 'helmet';
const logger = require('./src/middleware/logger');
const cors = require('cors');
const { errors } = require('celebrate');

require('dotenv').config({ path: './.env' });

const router = express();

/** connect to mongo */
mongoose
    .connect(config.db)
    .then(() => {
        Logging.info('Connected to MongoDB');
        StartServer();
    })
    .catch((err) => {
        Logging.error('Unable to connect: ');
        Logging.error(err);
    });

router.use(cors());
router.options('*', cors());

router.use(helmet());

// router.use(limiter);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use(logger.requestLogger);

// routes
router.use(routes);

router.use(logger.errorLogger);

// central error handler
router.use(errors());
router.use(errorHandler);

/** only start server if mongo connects */
const StartServer = () => {
    const server = http.createServer(router);

    server.listen(config.port, () => {
        Logging.info(`Server started on port ${config.port}`);
    });
};
