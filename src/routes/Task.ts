import express, { Router } from 'express';
import controllers from '../controllers/Task';

const { assignTask, getTasks, getAllTasks } = controllers;

const router: Router = express.Router();

router.post('/:employeeId', assignTask);
router.get('/:employeeId', getTasks);
router.get('/', getAllTasks);

export default router;
