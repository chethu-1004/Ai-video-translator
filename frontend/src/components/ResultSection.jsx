import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, Download, Subtitles, 
  RotateCcw, Clock, FileVideo, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getMediaUrl } from '../utils/api'

const ResultSection = ({ result, onReset }) => {
  
  if (!result) {
    return (
      <div className="glass-card p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-500/20 flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-white/20 border-t-primary-500 rounded-full" />
        </motion.div>
        <p className="text-white/60">Loading result...</p>
      </div>
    )
  }

  const handleDownload = () => {
    const videoUrl = getMediaUrl(result.outputUrl)
    if (videoUrl) {
      const link = document.createElement('a')
      link.href = videoUrl
      link.download = `translated_${result.jobId}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started!')
    }
  }

  const handleDownloadSubtitles = () => {
    const subtitleUrl = getMediaUrl(result.subtitleUrl)
    if (subtitleUrl) {
      const link = document.createElement('a')
      link.href = subtitleUrl
      link.download = `subtitles_${result.jobId}.srt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Subtitles downloaded!')
    }
  }

  const formatDuration = (ms) => {
    if (!ms) return 'Unknown'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 
                      flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">Translation Complete!</h3>
        <p className="text-white/60 mb-4">
          Your video has been successfully translated and is ready for download.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-white/50">
            <Clock className="w-4 h-4" />
            <span>Processed in {formatDuration(result.processingTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <FileVideo className="w-4 h-4" />
            <span>{result.metadata?.duration ? Math.round(result.metadata.duration) : 0}s video</span>
          </div>
        </div>
      </motion.div>

      {/* Video Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <video
            src={getMediaUrl(result.outputUrl)}
            className="w-full h-full"
            controls
            poster=""
          >
            {result.subtitleUrl && (
              <track
                kind="subtitles"
                src={getMediaUrl(result.subtitleUrl)}
                srcLang="target"
                label="Translated"
                default={true}
              />
            )}
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Controls */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center flex-wrap gap-4">
            {/* Video Info */}
            <div className="text-sm text-white/50">
              {result.metadata && (
                <span>{result.metadata.width}x{result.metadata.height} • {Math.round(result.metadata.fps)}fps</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Download Video */}
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center justify-center gap-2 py-4"
        >
          <Download className="w-5 h-5" />
          Download Video
        </button>

        {/* Download Subtitles */}
        {result.subtitleUrl && (
          <button
            onClick={handleDownloadSubtitles}
            className="btn-secondary flex items-center justify-center gap-2 py-4"
          >
            <Subtitles className="w-5 h-5" />
            Download Subtitles
          </button>
        )}
      </motion.div>

      {/* Secondary Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4"
      >
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 
                    text-white/70 hover:text-white transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          Translate Another
        </button>
      </motion.div>

      {/* Storage Notice */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/60">
            <p className="text-white/80 mb-1">Storage Notice</p>
            <p>Your translated video will be available for download for 24 hours. 
               Make sure to download it before it expires.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultSection
