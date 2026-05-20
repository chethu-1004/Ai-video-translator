import path from 'path';
import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { addJob } from '../utils/jobQueue.js';

const uploadsDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const outputsDir = path.resolve(process.env.OUTPUT_DIR || './outputs');

// In-memory storage for job metadata (replace with Redis/DB in production)
export const jobsDB = new Map();

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    const error = new Error('No video file uploaded');
    error.statusCode = 400;
    throw error;
  }

  const jobId = uuidv4();
  const videoPath = req.file.path;
  const originalName = req.file.originalname;
  const fileSize = req.file.size;

  try {
    // Get video metadata using FFprobe
    const metadata = await getVideoMetadata(videoPath);
    
    const job = {
      id: jobId,
      status: 'uploaded',
      originalName,
      fileSize,
      videoPath,
      outputsDir: path.join(outputsDir, jobId),
      metadata: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        codec: metadata.codec
      },
      createdAt: new Date().toISOString(),
      userId: req.user?.id || null,
      progress: {
        stage: 'upload_complete',
        percentage: 5,
        message: 'Upload complete. Ready for processing.'
      }
    };

    // Create output directory for this job
    fs.ensureDirSync(job.outputsDir);
    
    // Store job
    jobsDB.set(jobId, job);

    // Emit upload complete event via Socket.IO
    if (req.io) {
      req.io.emit(`job-${jobId}`, {
        type: 'upload_complete',
        jobId,
        progress: job.progress
      });
    }

    res.status(201).json({
      success: true,
      data: {
        jobId,
        status: job.status,
        metadata: job.metadata,
        progress: job.progress
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    await fs.remove(videoPath);
    throw error;
  }
};

export const getVideoInfo = async (req, res) => {
  const { jobId } = req.params;
  const job = jobsDB.get(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status,
      metadata: job.metadata,
      progress: job.progress
    }
  });
};

function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      
      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : 0,
        codec: videoStream?.codec_name || 'unknown',
        bitrate: metadata.format.bit_rate || 0
      });
    });
  });
}

