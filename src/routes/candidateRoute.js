import express from 'express'
import * as candidateController from '../controller/candidateController.js'

const router = express.Router();
router.post('/candidate/list',candidateController.listCandidate);
router.post('/candidate/id',candidateController.getCandidateById);
router.post('/candidate',candidateController.addCandidate);
router.post('/candidate/filter', candidateController.getFilterOptions);
router.delete('/candidate', candidateController.deleteCandidate);
router.put('/candidate', candidateController.updateCandidate);

export default router;
