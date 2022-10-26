import express from 'express';
import controller from '../controllers/Employee';

const router = express.Router();

router.post('/', controller.createEmployee);
router.get('/:employeeID', controller.getEmployee);
router.get('/', controller.getAllEmployees);

export default router;
