import express from 'express'

import * as applicantController from '../controller/applicantController.js'

const router = express.Router();

router.post('/applicant', applicantController.addApplicant);
router.post('/applicant/list',applicantController.listApplicant);
router.post('/applicant/id',applicantController.getApplicantById);
router.post('/applicant/filter', applicantController.getFilterOptions);
router.delete('/applicant',applicantController.deleteApplicant);
router.put('/applicant', applicantController.updateApplicant);
router.post('/applicant/jobid', applicantController.getApplicantsByJobId);

export default router;

