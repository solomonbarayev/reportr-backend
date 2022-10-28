import express, { Router } from 'express';
import { createReport, getReportsForUser } from '../controllers/Report';
import { validateReport } from '../middleware/validation';

const router: Router = express.Router();

router.post('/:managerId', validateReport, createReport);
router.get('/', getReportsForUser);

export default router;
