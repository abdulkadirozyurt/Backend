import express from 'express'
import * as jobAdvertisementController from '../controller/jobAdvertisementController.js'


const router = express.Router();

router.post('/jobAdvertisement/list', jobAdvertisementController.listJobAdvertisement);

router.post('/jobAdvertisement/id', jobAdvertisementController.getJobAdvertisementById);

router.post('/jobAdvertisement', jobAdvertisementController.addJobAdvertisement);

router.post('/jobAdvertisement/filter', jobAdvertisementController.getFilterOptions);

router.delete('/jobAdvertisement', jobAdvertisementController.deleteJobAdvertisement);

router.put('/jobAdvertisement', jobAdvertisementController.updateJobAdvertisement);

export default router;
