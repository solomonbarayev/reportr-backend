import express from 'express';

import employeeRouter from './Employee';
import managerRouter from './Manager';
import taskRouter from './Task';
import reportRouter from './Report';
import auth from '../middleware/auth';
import login from '../controllers/Auth';
import register from '../controllers/Employee';
import { validateAuthentication, validateEmployee } from '../middleware/validation';
import NotFoundError from '../errors/NotFoundError';
import controller from '../controllers/Employee';

const router = express.Router();

router.post('/signup', validateEmployee, register.createEmployee);
router.post('/signin', validateAuthentication, login);

//get employees pre-auth for signup page
router.get('/employees', controller.getAllEmployees);

router.use(auth);

router.use('/employees', employeeRouter);
router.use('/managers', managerRouter);
router.use('/tasks', taskRouter);
router.use('/reports', reportRouter);

//non route
router.use('*', (req, res, next) => {
    throw new NotFoundError('Route not found');
});

export default router;
