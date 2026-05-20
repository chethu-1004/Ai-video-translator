import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileVideo, X, Check, AlertCircle } from 'lucide-react'

const UploadSection = ({ onFileUpload, uploadedFile, jobStatus }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mkv', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    disabled: !!uploadedFile
  })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }
            ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="p-8 sm:p-12 text-center">
            <motion.div
              animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 
                        flex items-center justify-center"
            >
              <Upload className={`w-10 h-10 ${isDragActive ? 'text-primary-400' : 'text-white/50'}`} />
            </motion.div>
            
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
            </p>
            <p className="text-white/50 text-sm mb-4">
              or click to browse files
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-white/30">
              <FileVideo className="w-4 h-4" />
              <span>MP4, MKV, MOV, AVI, WebM</span>
              <span className="mx-1">•</span>
              <span>Max 100MB</span>
            </div>
          </div>

          {/* Gradient Border Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-accent-purple/20 to-primary-500/0 
                          opacity-0 hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      ) : (
        /* Uploaded File Preview */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-4">
            {/* Thumbnail Placeholder */}
            <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-surface-light to-surface 
                          flex items-center justify-center flex-shrink-0">
              <FileVideo className="w-8 h-8 text-white/30" />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{uploadedFile.name}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                <span>{formatFileSize(uploadedFile.size)}</span>
                {jobStatus?.metadata?.duration && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(jobStatus.metadata.duration)}
                  </span>
                )}
                {jobStatus?.metadata?.width && (
                  <span>{jobStatus.metadata.width}x{jobStatus.metadata.height}</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {jobStatus ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Uploaded</span>
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-white/20 border-t-primary-500 rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Video Metadata */}
          {jobStatus?.metadata && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/40 text-xs">Codec</p>
                <p className="font-medium">{jobStatus.metadata.codec}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">FPS</p>
                <p className="font-medium">{Math.round(jobStatus.metadata.fps)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Bitrate</p>
                <p className="font-medium">{Math.round(jobStatus.metadata.bitrate / 1000)} kbps</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Guidelines */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/60">
            <p className="font-medium text-white/80 mb-1">Tips for best results:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use clear audio without background music for better transcription</li>
              <li>Videos with single speakers translate better than group conversations</li>
              <li>Processing time is approximately 2x the video duration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadSection
