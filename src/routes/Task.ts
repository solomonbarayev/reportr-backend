import express, { Router } from 'express';
import controllers from '../controllers/Task';
import { validateTask, validateObjectId } from '../middleware/validation';

const { assignTask, getTasksForEmployee, getCurrentUserTasks, getAllTasks, deleteTask } = controllers;

const router: Router = express.Router();

router.get('/');
router.get('/mytasks', getCurrentUserTasks);
router.post('/:employeeID', validateObjectId, validateTask, assignTask);
router.get('/:employeeID', validateObjectId, getTasksForEmployee);
router.get('/', getAllTasks);
router.delete('/:taskId', deleteTask);

export default router;
