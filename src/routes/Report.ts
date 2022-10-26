import express, { Router } from 'express';
import { createReport, getReportsForUser } from '../controllers/Report';

const router: Router = express.Router();

router.post('/', createReport);
router.get('/', getReportsForUser);

export default router;
