import express, { Router } from 'express';
import controllers from '../controllers/Task';
import { validateTask, validateObjectId } from '../middleware/validation';

const { assignTask, getTasks, getAllTasks, deleteTask } = controllers;

const router: Router = express.Router();

router.post('/:employeeID', validateObjectId, /*valdiateTask,*/ assignTask);
router.get('/:employeeID', validateObjectId, getTasks);
router.get('/', getAllTasks);
router.delete('/:id', deleteTask);

export default router;
