import express from 'express';
import controller from '../controllers/Employee';
import { validateObjectId } from '../middleware/validation';

const router = express.Router();

router.get('/:employeeID', validateObjectId, controller.getEmployee);
router.get('/', controller.getAllEmployees);
router.patch('/:employeeID', validateObjectId, controller.updateEmployee);
router.delete('/:employeeID', validateObjectId, controller.deleteEmployee);

export default router;
