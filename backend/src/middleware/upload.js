import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';

const uploadsDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFormats = (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,mkv,mov,avi,webm')
    .split(',')
    .map(format => format.trim().toLowerCase());
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 104857600; // 100MB default

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1
  }
});
