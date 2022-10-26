import express, { Router } from 'express';
import controllers from '../controllers/Task';

const { assignTask, getTasks } = controllers;

const router: Router = express.Router();

router.post('/:employeeId', assignTask);
router.get('/:employeeId', getTasks);

export default router;
