import express from 'express';
import controller from '../controllers/Employee';
import { validateObjectId } from '../middleware/validation';

const router = express.Router();

router.get('/myprofile', controller.getCurrentLoggedInEmployee);
router.get('/:employeeID', validateObjectId, controller.getEmployee);
router.get('/', controller.getAllEmployees);
router.delete('/', controller.deleteAllEmployees);

export default router;
