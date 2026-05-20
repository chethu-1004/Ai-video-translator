import path from 'path';
import { jobsDB } from './uploadController.js';
import { addJob, getJobStatus as getQueueJobStatus, cancelJob as cancelQueueJob } from '../utils/jobQueue.js';

const validTargetLanguages = ['hi', 'kn', 'te', 'ml'];
const languageNames = {
  hi: 'Hindi',
  kn: 'Kannada',
  te: 'Telugu',
  ml: 'Malayalam'
};

export const startProcessing = async (req, res) => {
  const { jobId, sourceLanguage, targetLanguage, options = {} } = req.body;

  if (!jobId) {
    const error = new Error('Job ID is required');
    error.statusCode = 400;
    throw error;
  }

  if (!targetLanguage || !validTargetLanguages.includes(targetLanguage)) {
    const error = new Error(`Invalid target language. Must be one of: ${validTargetLanguages.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const job = jobsDB.get(jobId);
  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.status === 'processing' || job.status === 'completed') {
    const error = new Error(`Job is already ${job.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Update job with processing parameters
  job.status = 'queued';
  job.sourceLanguage = sourceLanguage || 'auto';
  job.targetLanguage = targetLanguage;
  job.targetLanguageName = languageNames[targetLanguage];
  job.options = {
    generateSubtitles: options.generateSubtitles !== false,
    subtitlePosition: options.subtitlePosition || 'bottom',
    audioSyncAdjustment: options.audioSyncAdjustment || 0,
    preserveBackgroundAudio: options.preserveBackgroundAudio !== false,
    ...options
  };
  job.progress = {
    stage: 'queued',
    percentage: 10,
    message: 'Job queued for processing.'
  };

  // Add to processing queue
  addJob(job, req.io);

  res.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      estimatedTime: estimateProcessingTime(job.metadata.duration)
    }
  });
};

export const getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = jobsDB.get(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  // Get real-time status from queue
  const queueStatus = getQueueJobStatus(jobId);

  res.json({
    success: true,
    data: {
      jobId: job.id,
      status: queueStatus?.status || job.status,
      progress: queueStatus?.progress || job.progress,
      metadata: job.metadata,
      sourceLanguage: job.sourceLanguage,
      targetLanguage: job.targetLanguage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }
  });
};

export const getJobResult = async (req, res) => {
  const { jobId } = req.params;
  const job = jobsDB.get(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.status !== 'completed') {
    const error = new Error(`Job is not completed yet. Current status: ${job.status}`);
    error.statusCode = 400;
    throw error;
  }

  res.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status,
      outputUrl: job.outputUrl,
      subtitleUrl: job.subtitleUrl,
      metadata: job.metadata,
      processingTime: job.processingTime,
      downloadUrl: `/outputs/${jobId}/translated_video.mp4`
    }
  });
};

export const cancelJob = async (req, res) => {
  const { jobId } = req.params;
  const job = jobsDB.get(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.status === 'completed' || job.status === 'failed') {
    const error = new Error(`Cannot cancel a ${job.status} job`);
    error.statusCode = 400;
    throw error;
  }

  cancelQueueJob(jobId);
  job.status = 'cancelled';
  job.progress = {
    stage: 'cancelled',
    percentage: 0,
    message: 'Job cancelled by user.'
  };

  res.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status
    }
  });
};

export const listJobs = async (req, res) => {
  const userId = req.user?.id;
  const allJobs = Array.from(jobsDB.values());
  
  // Filter by user if authenticated, otherwise show all recent jobs
  const jobs = userId 
    ? allJobs.filter(j => j.userId === userId)
    : allJobs.slice(-20); // Last 20 jobs for unauthenticated users

  res.json({
    success: true,
    data: jobs.map(job => ({
      jobId: job.id,
      status: job.status,
      originalName: job.originalName,
      targetLanguage: job.targetLanguage,
      progress: job.progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      outputUrl: job.outputUrl,
      subtitleUrl: job.subtitleUrl
    }))
  });
};

function estimateProcessingTime(duration) {
  // Rough estimate: 2x real-time for processing
  const estimatedSeconds = Math.ceil(duration * 2);
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
