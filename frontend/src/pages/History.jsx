import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Clock, FileVideo, Languages, CheckCircle, XCircle, Loader2,
  Trash2, Download, ExternalLink, AlertCircle, RefreshCcw
} from 'lucide-react'
import toast from 'react-hot-toast'
import api, { getMediaUrl } from '../utils/api'

const History = () => {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/process/jobs')
      if (response.data.success) {
        setJobs(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <Clock className="w-5 h-5 text-white/40" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'processing':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-white/10 text-white/60 border-white/20'
    }
  }

  const getLanguageName = (code) => {
    const languages = {
      hi: 'Hindi',
      kn: 'Kannada',
      te: 'Telugu',
      ml: 'Malayalam',
    }
    return languages[code] || code
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your history?')) {
      localStorage.removeItem('videoTranslatorJobs')
      setJobs([])
      toast.success('History cleared')
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Translation History</h1>
              <p className="text-white/60">
                View and manage your previous video translations
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchJobs}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white 
                          transition-all duration-300"
                title="Refresh"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleClearHistory}
                className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 
                          transition-all duration-300"
                title="Clear History"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-500/20 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-primary-400" />
            </motion.div>
            <p className="text-white/60">Loading history...</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileVideo className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Translations Yet</h3>
            <p className="text-white/60 mb-6">
              Start translating your videos and they will appear here.
            </p>
            <Link 
              to="/translate" 
              className="btn-primary inline-flex items-center gap-2"
            >
              Translate Your First Video
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.jobId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(job.status)}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium truncate">{job.originalName || 'Unknown Video'}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(job.createdAt)}
                      </span>
                      {job.targetLanguage && (
                        <span className="flex items-center gap-1">
                          <Languages className="w-4 h-4" />
                          To {getLanguageName(job.targetLanguage)}
                        </span>
                      )}
                      {job.fileSize && (
                        <span>{formatFileSize(job.fileSize)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <button
                        onClick={() => {
                          const url = getMediaUrl(job.outputUrl)
                          if (url) {
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `translated_${job.jobId}.mp4`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            toast.success('Download started!')
                          }
                        }}
                        className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 
                                  transition-all duration-300"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    
                    {(job.status === 'processing' || job.status === 'queued') && (
                      <Link
                        to={`/translate?job=${job.jobId}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white 
                                  transition-all duration-300"
                        title="View Progress"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Active Jobs */}
                {(job.status === 'processing' || job.status === 'queued') && job.progress && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">{job.progress.message}</span>
                      <span className="text-white/40">{job.progress.percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${job.progress.percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Notice */}
        <div className="mt-8 glass p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/60">
              <p className="text-white/80 mb-1">Storage Information</p>
              <p>
                Translated videos are stored for 24 hours. Make sure to download your results 
                before they expire. You can translate up to 100MB per video.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default History
