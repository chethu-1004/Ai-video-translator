import express from 'express';
import { uploadVideo, getVideoInfo } from '../controllers/uploadController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload - Upload a video file
router.post(
  '/',
  optionalAuth,
  uploadMiddleware.single('video'),
  asyncHandler(uploadVideo)
);

// GET /api/upload/:jobId/info - Get video metadata
router.get(
  '/:jobId/info',
  asyncHandler(getVideoInfo)
);

export default router;
