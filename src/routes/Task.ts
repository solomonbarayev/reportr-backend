import express, { Router } from 'express';
import controllers from '../controllers/Task';
import { validateTask, validateObjectId } from '../middleware/validation';

const { assignTask, getTasks, getAllTasks } = controllers;

const router: Router = express.Router();

router.post('/:employeeID', validateObjectId, validateTask, assignTask);
router.get('/:employeeID', validateObjectId, getTasks);
router.get('/', getAllTasks);

export default router;
