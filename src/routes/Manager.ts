import express, { Router } from 'express';
import controllers from '../controllers/Manager';

const { getReportsForManager } = controllers;

const router: Router = express.Router();

router.get('/', getReportsForManager);

export default router;
