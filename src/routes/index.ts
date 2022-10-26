import express from 'express';

import employeeRouter from './Employee';
import managerRouter from './Manager';
import taskRouter from './Task';
import reportRouter from './Report';
import auth from '../middleware/auth';
import login from '../controllers/Auth';
import register from '../controllers/Employee';
import { validateAuthentication, validateEmployee } from '../middleware/validation';

const router = express.Router();

router.post('/signup', validateEmployee, register.createEmployee);
router.post('/signin', validateAuthentication, login);

router.use(auth);

router.use('/employees', employeeRouter);
router.use('/managers', managerRouter);
router.use('/tasks', taskRouter);
router.use('/reports', reportRouter);

export default router;
