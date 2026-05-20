import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { jobsDB } from '../controllers/uploadController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Queue management
const jobQueue = [];
const activeJobs = new Map();
let maxConcurrentJobs = parseInt(process.env.MAX_CONCURRENT_JOBS) || 2;
let ioInstance = null;

export const initializeJobQueue = (io) => {
  ioInstance = io;
};

export const addJob = (job, io) => {
  if (io && !ioInstance) {
    ioInstance = io;
  }
  
  jobQueue.push(job);
  processQueue();
};

export const getJobStatus = (jobId) => {
  const activeJob = activeJobs.get(jobId);
  if (activeJob) {
    return {
      status: activeJob.status,
      progress: activeJob.progress
    };
  }
  
  const queuedJob = jobQueue.find(j => j.id === jobId);
  if (queuedJob) {
    return {
      status: 'queued',
      progress: queuedJob.progress
    };
  }
  
  return null;
};

export const cancelJob = (jobId) => {
  const activeJob = activeJobs.get(jobId);
  if (activeJob && activeJob.process) {
    activeJob.process.kill('SIGTERM');
    activeJobs.delete(jobId);
  }
  
  const queueIndex = jobQueue.findIndex(j => j.id === jobId);
  if (queueIndex > -1) {
    jobQueue.splice(queueIndex, 1);
  }
};

const processQueue = () => {
  if (activeJobs.size >= maxConcurrentJobs || jobQueue.length === 0) {
    return;
  }

  const job = jobQueue.shift();
  if (!job || job.status === 'cancelled') {
    processQueue();
    return;
  }

  activeJobs.set(job.id, job);
  processJob(job);
};

const processJob = async (job) => {
  const startTime = Date.now();
  
  const updateProgress = (stage, percentage, message, details = {}) => {
    job.progress = { stage, percentage, message, ...details };
    job.updatedAt = new Date().toISOString();
    
    // Update in jobsDB
    const storedJob = jobsDB.get(job.id);
    if (storedJob) {
      storedJob.progress = job.progress;
      storedJob.updatedAt = job.updatedAt;
    }
    
    // Emit via Socket.IO
    if (ioInstance) {
      ioInstance.to(`job-${job.id}`).emit('progress', {
        jobId: job.id,
        ...job.progress
      });
    }
  };

  try {
    console.log(`[Job ${job.id}] Starting processing...`);
    job.status = 'processing';
    updateProgress('audio_extraction', 15, 'Extracting audio from video...');

    // Use Sarvam AI processing pipeline
    const scriptPath = path.join(__dirname, '../scripts/process_video_sarvam.py');
    
    console.log(`[Job ${job.id}] Using Sarvam AI processing pipeline`);
    console.log(`[Job ${job.id}] Target language: ${job.targetLanguage}, Source: ${job.sourceLanguage}`);
    
    const pythonArgs = [
      scriptPath,
      '--video_path', job.videoPath,
      '--output_dir', job.outputsDir,
      '--job_id', job.id,
      '--source_lang', job.sourceLanguage,
      '--target_lang', job.targetLanguage
    ];
    
    console.log(`[Job ${job.id}] Python args:`, pythonArgs.join(' '));

    if (job.options.generateSubtitles) {
      pythonArgs.push('--generate_subtitles');
    }

    const pythonProcess = spawn('py', pythonArgs, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    });

    job.process = pythonProcess;
    let stderrOutput = '';

    // Handle stdout for progress updates
    pythonProcess.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          try {
            const progress = JSON.parse(line);
            if (progress.stage && progress.percentage !== undefined) {
              updateProgress(
                progress.stage,
                progress.percentage,
                progress.message || 'Processing...',
                progress.details || {}
              );
              
              // If Python reports completion, update status immediately
              // (before waiting for process close to avoid race condition)
              if (progress.stage === 'completed') {
                job.status = 'completed';
                job.outputUrl = `/outputs/${job.id}/translated_video.mp4`;
                job.subtitleUrl = job.options?.generateSubtitles 
                  ? `/outputs/${job.id}/subtitles.srt` 
                  : null;
                const storedJob = jobsDB.get(job.id);
                if (storedJob) {
                  storedJob.status = 'completed';
                  storedJob.outputUrl = job.outputUrl;
                  storedJob.subtitleUrl = job.subtitleUrl;
                }
              }
            }
          } catch (e) {
            console.log(`[Job ${job.id}] ${line}`);
          }
        }
      });
    });

    // Handle stderr - capture all error output
    pythonProcess.stderr.on('data', (data) => {
      const errorData = data.toString();
      stderrOutput += errorData;
      console.error(`[Job ${job.id}] Error: ${errorData}`);
    });

    // Wait for completion
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          const errorMsg = stderrOutput || `Processing failed with code ${code}`;
          reject(new Error(errorMsg));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(err);
      });
    });

    // Mark as completed
    job.status = 'completed';
    job.processingTime = Date.now() - startTime;
    job.outputUrl = `/outputs/${job.id}/translated_video.mp4`;
    job.subtitleUrl = job.options.generateSubtitles 
      ? `/outputs/${job.id}/subtitles.srt` 
      : null;
    
    updateProgress('completed', 100, 'Translation completed successfully!', {
      outputUrl: job.outputUrl,
      processingTime: job.processingTime
    });

    // Update jobsDB
    const storedJob = jobsDB.get(job.id);
    if (storedJob) {
      storedJob.status = job.status;
      storedJob.outputUrl = job.outputUrl;
      storedJob.subtitleUrl = job.subtitleUrl;
      storedJob.processingTime = job.processingTime;
    }

    console.log(`[Job ${job.id}] Completed in ${job.processingTime}ms`);

  } catch (error) {
    console.error(`[Job ${job.id}] Processing failed:`, error);
    
    job.status = 'failed';
    job.error = error.message;
    
    updateProgress('failed', 0, `Processing failed: ${error.message}`);

    // Update jobsDB
    const storedJob = jobsDB.get(job.id);
    if (storedJob) {
      storedJob.status = 'failed';
      storedJob.error = error.message;
    }
  } finally {
    activeJobs.delete(job.id);
    processQueue();
  }
};
