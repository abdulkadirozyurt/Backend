import express from 'express'
import * as talentPoolController from '../controller/talentPoolController.js'

const router = express.Router();

router.post('/talentPool/list', talentPoolController.getTalentPools);

router.post('/talentPool/id', talentPoolController.getTalentPoolById);

router.post('/talentPool', talentPoolController.createTalentPool);

router.delete('/talentPool', talentPoolController.deleteTalentPool);

router.put('/talentPool', talentPoolController.updateTalentPool);

router.post('/talentPoolAddCandidate', talentPoolController.addCandidateToPool);

router.delete('/talentPoolDeleteCandidate', talentPoolController.deleteCandidateFromPool);

export default router;
