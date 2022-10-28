import express from 'express';
import controller from '../controllers/Employee';
import { validateObjectId } from '../middleware/validation';

const router = express.Router();

router.get('/myprofile', controller.getMyEmployeeProfile);
router.get('/:employeeID', validateObjectId, controller.getEmployee);
router.get('/', controller.getAllEmployees);
router.patch('/:employeeID', controller.updateEmployee);
router.delete('/:employeeID', validateObjectId, controller.deleteEmployee);
router.delete('/', controller.deleteAllEmployees);

export default router;
