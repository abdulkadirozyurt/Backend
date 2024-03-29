import express from 'express'
import * as fileController from '../controller/fileController.js'
import *as upload from '../middleware/upload.js';

const router = express.Router();


router.post('/file',upload.upload.single('file') ,fileController.addFile);
router.delete('/file',fileController.deleteFile);

export default router;