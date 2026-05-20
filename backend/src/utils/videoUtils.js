import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';

export const extractAudio = (videoPath, outputAudioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .on('end', () => resolve(outputAudioPath))
      .on('error', reject)
      .save(outputAudioPath);
  });
};

export const getVideoInfo = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      resolve({
        duration: parseFloat(metadata.format.duration) || 0,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : 0,
        videoCodec: videoStream?.codec_name || 'unknown',
        audioCodec: audioStream?.codec_name || 'unknown',
        bitrate: parseInt(metadata.format.bit_rate) || 0
      });
    });
  });
};

export const mergeAudioVideo = (
  videoPath, 
  audioPath, 
  outputPath, 
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const { subtitlePath, syncAdjustment = 0 } = options;
    
    let command = ffmpeg();
    
    // Add video input
    command = command.input(videoPath);
    
    // Add audio input
    command = command.input(audioPath);
    
    // Set video codec to copy (preserve original video quality)
    command = command.videoCodec('copy');
    
    // Set audio codec
    command = command.audioCodec('aac').audioBitrate('192k');
    
    // Handle audio sync adjustment
    if (syncAdjustment !== 0) {
      command = command.audioFilters(`adelay=${syncAdjustment}|${syncAdjustment}`);
    }
    
    // Add subtitles if provided
    if (subtitlePath && fs.existsSync(subtitlePath)) {
      command = command.input(subtitlePath);
      command = command.outputOptions([
        '-c:s mov_text',
        '-metadata:s:s:0 language=eng'
      ]);
    }
    
    // Map streams
    command = command.outputOptions([
      '-map 0:v:0',  // Video from first input
      '-map 1:a:0',  // Audio from second input
      '-shortest'
    ]);
    
    command
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
};

export const generateThumbnail = (videoPath, outputPath, time = '00:00:01') => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [time],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '640x360'
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};

export const addSubtitlesToVideo = (videoPath, subtitlePath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(subtitlePath)
      .outputOptions([
        '-c:v copy',
        '-c:a copy',
        '-c:s mov_text',
        '-metadata:s:s:0 language=eng'
      ])
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
};

export const cleanupJobFiles = async (jobDir) => {
  try {
    await fs.remove(jobDir);
    return true;
  } catch (error) {
    console.error('Cleanup failed:', error);
    return false;
  }
};
