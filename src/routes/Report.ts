import express, { Router } from 'express';
import { createReport, getReportsForUser } from '../controllers/Report';
import { validateReport } from '../middleware/validation';

const router: Router = express.Router();

router.get('/myreports', getReportsForUser);
router.post('/:managerId', validateReport, createReport);

export default router;
