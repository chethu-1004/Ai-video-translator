import express from 'express';
import { 
  startProcessing, 
  getJobStatus, 
  getJobResult,
  cancelJob,
  listJobs
} from '../controllers/processController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/process - Start video processing
router.post(
  '/',
  optionalAuth,
  asyncHandler(startProcessing)
);

// GET /api/process/jobs - List all jobs
router.get(
  '/jobs',
  optionalAuth,
  asyncHandler(listJobs)
);

// GET /api/process/:jobId/status - Get job status
router.get(
  '/:jobId/status',
  asyncHandler(getJobStatus)
);

// GET /api/process/:jobId/result - Get job result
router.get(
  '/:jobId/result',
  asyncHandler(getJobResult)
);

// POST /api/process/:jobId/cancel - Cancel a job
router.post(
  '/:jobId/cancel',
  asyncHandler(cancelJob)
);

export default router;
