import http from 'http';
import express from 'express';
import { NextFunction, Request, Response } from 'express';

import mongoose from 'mongoose';
import employeeRoutes from './src/routes/Employee';
import Logging from './src/library/Logging';
import auth from './src/middleware/auth';
import login from './src/controllers/Auth';
import register from './src/controllers/Employee';

const router = express();

/** connect to mongo */
mongoose
    .connect('mongodb://localhost:27017/reportrDB')
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

router.post('/signup', register.createEmployee);
router.post('/signin', login);

router.use(auth);

router.use('/employees', employeeRoutes);

/** only start server if mongo connects */
const StartServer = () => {
    const server = http.createServer(router);

    server.listen(3000, () => {
        Logging.info(`Server started on port 3000`);
    });
};
