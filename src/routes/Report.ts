import express, { Router } from 'express';
import { createReport, getReportsForUser, getReportsForCurrentUser, deleteAllReports } from '../controllers/Report';
import { validateReport } from '../middleware/validation';

const router: Router = express.Router();

router.get('/', getReportsForUser);
router.get('/myreports', getReportsForCurrentUser);
router.post('/:managerId', validateReport, createReport);
router.delete('/', deleteAllReports);

export default router;
