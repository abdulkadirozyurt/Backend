import express from 'express'
import * as kanbanController from '../controller/kanbanContoller.js'

const router = express.Router();
router.post('/kanban/id',kanbanController.getKanbanByJobId);
router.post('/kanban',kanbanController.addColumn);
router.delete('/kanban', kanbanController.deleteColumn);
router.put('/kanban', kanbanController.updateColumn);

export default router;