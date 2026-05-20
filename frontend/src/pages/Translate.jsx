import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { 
  Upload, FileVideo, X, Languages, Settings, Sparkles,
  ChevronDown, AlertCircle, Clock, Volume2, Subtitles, Sliders
} from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import UploadSection from '../components/UploadSection'
import ProcessingSection from '../components/ProcessingSection'
import ResultSection from '../components/ResultSection'
import api from '../utils/api'

const TARGET_LANGUAGES = [
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
]

const SOURCE_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🔍' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
]

const Translate = () => {
  const [currentStep, setCurrentStep] = useState('upload') // upload, processing, result
  const [uploadedFile, setUploadedFile] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [result, setResult] = useState(null)
  
  // Translation options
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('hi')
  const [options, setOptions] = useState({
    generateSubtitles: true,
    subtitlePosition: 'bottom',
    audioSyncAdjustment: 0,
    preserveBackgroundAudio: true,
  })
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  
  const { joinJob, leaveJob, onJobProgress } = useSocket()

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return
    
    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 100MB.')
      return
    }
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    const validExtensions = ['.mp4', '.mkv', '.mov', '.avi', '.webm']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload MP4, MKV, MOV, AVI, or WebM.')
      return
    }
    
    setUploadedFile(file)
    
    const toastId = toast.loading('Uploading video...')
    
    try {
      const formData = new FormData()
      formData.append('video', file)
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          toast.loading(`Uploading: ${percentCompleted}%`, { id: toastId })
        },
      })
      
      if (response.data.success) {
        toast.success('Upload complete!', { id: toastId })
        setJobId(response.data.data.jobId)
        setJobStatus(response.data.data)
      } else {
        toast.error('Upload failed', { id: toastId })
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed', { id: toastId })
      setUploadedFile(null)
    }
  }, [])

  // Start processing
  const handleStartProcessing = async () => {
    if (!jobId) {
      toast.error('Please upload a video first')
      return
    }
    
    const toastId = toast.loading('Starting translation...')
    
    try {
      const response = await api.post('/process', {
        jobId,
        sourceLanguage,
        targetLanguage,
        options,
      })
      
      if (response.data.success) {
        toast.success('Translation started!', { id: toastId })
        setCurrentStep('processing')
        joinJob(jobId)
        
        // Listen for progress updates
        const unsubscribe = onJobProgress(jobId, (data) => {
          setJobStatus(prev => ({ ...prev, ...data }))
          
          if (data.stage === 'completed') {
            setCurrentStep('result')
            fetchResult()
            unsubscribe()
          }
        })
      } else {
        toast.error('Failed to start translation', { id: toastId })
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start translation', { id: toastId })
    }
  }

  // Fetch final result
  const fetchResult = async () => {
    if (!jobId) return
    
    try {
      const response = await api.get(`/process/${jobId}/result`)
      if (response.data.success) {
        setResult(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch result:', error)
    }
  }

  // Reset for new translation
  const handleReset = () => {
    if (jobId) {
      leaveJob(jobId)
    }
    setCurrentStep('upload')
    setUploadedFile(null)
    setJobId(null)
    setJobStatus(null)
    setResult(null)
    setSourceLanguage('auto')
    setTargetLanguage('hi')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jobId) {
        leaveJob(jobId)
      }
    }
  }, [jobId, leaveJob])

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Translate Video</h1>
          <p className="text-white/60">
            Upload your video and translate it to any Indian language using AI.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['upload', 'processing', 'result'].map((step, index) => {
            const isActive = currentStep === step
            const isCompleted = 
              (step === 'upload' && (currentStep === 'processing' || currentStep === 'result')) ||
              (step === 'processing' && currentStep === 'result')
            
            const stepNames = { upload: 'Upload', processing: 'Processing', result: 'Result' }
            
            return (
              <div key={step} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive ? 'bg-gradient-to-r from-primary-500 to-accent-purple text-white' : ''}
                  ${isCompleted ? 'bg-white/10 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-white/5 text-white/40' : ''}
                `}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive ? 'bg-white/20' : ''}
                    ${isCompleted ? 'bg-primary-500' : ''}
                    ${!isActive && !isCompleted ? 'bg-white/10' : ''}
                  `}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {stepNames[step]}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 transition-all duration-300
                    ${isCompleted ? 'bg-primary-500' : 'bg-white/10'}
                  `} />
                )}
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <UploadSection 
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                jobStatus={jobStatus}
              />

              {/* Language Selection */}
              {jobId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 
                                  flex items-center justify-center">
                      <Languages className="w-5 h-5 text-accent-purple" />
                    </div>
                    <h3 className="text-xl font-semibold">Select Languages</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Source Language */}
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Source Language
                      </label>
                      <select
                        value={sourceLanguage}
                        onChange={(e) => setSourceLanguage(e.target.value)}
                        className="select-field"
                      >
                        {SOURCE_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Language */}
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Target Language
                      </label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="select-field"
                      >
                        {TARGET_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Options
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Advanced Options */}
                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4 border-t border-white/10">
                          {/* Subtitles Toggle */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Subtitles className="w-5 h-5 text-primary-400" />
                              <div>
                                <p className="font-medium">Generate Subtitles</p>
                                <p className="text-sm text-white/50">Add translated subtitles to video</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={options.generateSubtitles}
                                onChange={(e) => setOptions({ ...options, generateSubtitles: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer 
                                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                                            after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                            </label>
                          </div>

                          {/* Audio Sync Adjustment */}
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <Sliders className="w-5 h-5 text-primary-400" />
                              <div>
                                <p className="font-medium">Audio Sync Adjustment</p>
                                <p className="text-sm text-white/50">
                                  {options.audioSyncAdjustment > 0 ? '+' : ''}{options.audioSyncAdjustment}ms
                                </p>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="-500"
                              max="500"
                              step="50"
                              value={options.audioSyncAdjustment}
                              onChange={(e) => setOptions({ ...options, audioSyncAdjustment: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-white/40 mt-1">
                              <span>-500ms</span>
                              <span>0ms</span>
                              <span>+500ms</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Start Button */}
                  <button
                    onClick={handleStartProcessing}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
                  >
                    <Sparkles className="w-5 h-5" />
                    Translate Video
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProcessingSection 
                jobStatus={jobStatus}
                targetLanguage={TARGET_LANGUAGES.find(l => l.code === targetLanguage)?.name}
              />
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ResultSection 
                result={result}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Translate
