import { motion } from 'framer-motion'
import { 
  Loader2, Mic, Languages, Volume2, Film, CheckCircle,
  Clock, ArrowRight, Sparkles
} from 'lucide-react'

const ProcessingSection = ({ jobStatus, targetLanguage }) => {
  const stages = [
    { id: 'upload_complete', label: 'Upload Complete', icon: CheckCircle, percent: 5 },
    { id: 'audio_extraction', label: 'Audio Extraction', icon: Mic, percent: 25 },
    { id: 'transcription', label: 'Speech Recognition', icon: Mic, percent: 45 },
    { id: 'translation', label: 'Translation', icon: Languages, percent: 70 },
    { id: 'tts', label: 'Voice Synthesis', icon: Volume2, percent: 90 },
    { id: 'merging', label: 'Final Rendering', icon: Film, percent: 100 },
  ]

  const currentStage = jobStatus?.progress?.stage || 'starting'
  const currentPercent = jobStatus?.progress?.percentage || 0
  const currentMessage = jobStatus?.progress?.message || 'Initializing...'

  const getStageStatus = (stage) => {
    const stageIndex = stages.findIndex(s => s.id === stage.id)
    const currentStageIndex = stages.findIndex(s => s.id === currentStage)
    
    if (stageIndex < currentStageIndex) return 'completed'
    if (stage.id === currentStage) return 'active'
    return 'pending'
  }

  const getStageProgress = (stage) => {
    const status = getStageStatus(stage)
    if (status === 'completed') return 100
    if (status === 'active') {
      // Calculate progress within the stage
      const prevStagePercent = stage.id === 'upload_complete' ? 0 : 
        stages[stages.findIndex(s => s.id === stage.id) - 1]?.percent || 0
      const stageRange = stage.percent - prevStagePercent
      const progressInStage = ((currentPercent - prevStagePercent) / stageRange) * 100
      return Math.max(0, Math.min(100, progressInStage))
    }
    return 0
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 
                      flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-primary-400" />
          </motion.div>
          
          <h3 className="text-2xl font-bold mb-2">Processing Video</h3>
          <p className="text-white/60">{currentMessage}</p>
          
          {targetLanguage && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/20 
                          text-accent-purple text-sm">
              <Sparkles className="w-4 h-4" />
              Translating to {targetLanguage}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-white/60">{currentPercent}% complete</span>
          <span className="text-white/40 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Processing...
          </span>
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="glass-card p-6">
        <h4 className="font-medium mb-4 text-white/80">Processing Pipeline</h4>
        
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage)
            const progress = getStageProgress(stage)
            const Icon = stage.icon
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300
                  ${status === 'active' ? 'bg-white/10' : ''}
                  ${status === 'completed' ? 'opacity-60' : ''}
                `}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                  ${status === 'active' ? 'bg-primary-500/20 text-primary-400' : ''}
                  ${status === 'pending' ? 'bg-white/5 text-white/30' : ''}
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${status === 'pending' ? 'text-white/40' : ''}`}>
                      {stage.label}
                    </span>
                    {status === 'active' && (
                      <span className="text-xs text-primary-400">{Math.round(progress)}%</span>
                    )}
                  </div>
                  
                  {/* Mini progress bar for active stage */}
                  {status === 'active' && (
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {index < stages.length - 1 && (
                  <ArrowRight className={`w-4 h-4 flex-shrink-0
                    ${status === 'completed' ? 'text-green-400' : 'text-white/20'}
                  `} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass p-4 rounded-xl">
        <p className="text-sm text-white/60 text-center">
          Please keep this page open. The translation is being processed on our servers.
          You'll be notified when it's ready.
        </p>
      </div>
    </div>
  )
}

export default ProcessingSection
