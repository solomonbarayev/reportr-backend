import express, { Router } from 'express';
import { createReport, getReportsForUser, deleteReport, deleteAllReportsForUser } from '../controllers/Report';
import { validateReport } from '../middleware/validation';

const router: Router = express.Router();

router.get('/myreports', getReportsForUser);
router.post('/:managerId', validateReport, createReport);
router.delete('/:reportId', deleteReport);
router.delete('/', deleteAllReportsForUser);

export default router;
