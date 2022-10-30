import express, { Router } from 'express';
import controllers from '../controllers/Manager';

const { getAllManagers } = controllers;

const router: Router = express.Router();

router.get('/all', getAllManagers);

export default router;
