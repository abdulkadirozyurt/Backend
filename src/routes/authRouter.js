import express from 'express';
import * as authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/auth", authMiddleware.authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    
    res.status(200).json({role: role});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

export default router;
