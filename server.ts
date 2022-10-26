import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import Logging from './src/library/Logging';
import routes from './src/routes/index';
import { config } from './src/config/config';
import errorHandler from './src/middleware/errorHandler';

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

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// routes
router.use(routes);

// central error handler
router.use(errorHandler);

/** only start server if mongo connects */
const StartServer = () => {
    const server = http.createServer(router);

    server.listen(config.port, () => {
        Logging.info(`Server started on port ${config.port}`);
    });
};
