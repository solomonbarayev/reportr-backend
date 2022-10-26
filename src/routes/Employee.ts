import express from 'express';
import controller from '../controllers/Employee';

const router = express.Router();

router.post('/', controller.createEmployee);
router.get('/:employeeID', controller.getEmployee);
router.get('/', controller.getAllEmployees);
router.patch('/:employeeID', controller.updateEmployee);
router.delete('/:employeeID', controller.deleteEmployee);

export default router;
