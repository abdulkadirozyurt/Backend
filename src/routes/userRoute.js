import express from 'express'
import * as userController from '../controller/userController.js'
import * as authMiddleware from '../middleware/authMiddleware.js'


const router = express.Router();

router.route("/login").post(userController.login);

router.route("/refreshAccessToken").post(userController.refreshAccessToken);

router.route("/register").post(userController.register);

router.route('/hrRegister').post(authMiddleware.authenticateToken, userController.hrRegister);

router.route('/listUsers').post(authMiddleware.authenticateToken, userController.listUsers);

router.route('/getUser/id').post(authMiddleware.authenticateToken,userController.getUserById);

router.route('/updateUser').put(authMiddleware.authenticateToken, userController.updateUser);

router.route('/deleteUser').delete(authMiddleware.authenticateToken, userController.deleteUser);
router.route('/forgotPassword').post( userController.forgotPassword);
router.route('/resetPassword').post(userController.resetPassword);



export default router;

