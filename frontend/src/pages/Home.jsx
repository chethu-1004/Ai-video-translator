import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Upload, Languages, Sparkles, Zap, Shield, Clock,
  ArrowRight, FileVideo, Volume2, Subtitles
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Languages,
      title: '4 Indian Languages',
      description: 'Translate to Hindi, Kannada, Telugu, and Malayalam with native-quality output.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Powered by Sarvam AI APIs for accurate speech-to-text, translation, and natural-sounding voice synthesis.'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Optimized pipeline delivers results quickly with real-time progress tracking.'
    },
    {
      icon: Subtitles,
      title: 'Subtitle Support',
      description: 'Generate translated subtitles that can be toggled on/off during playback.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your videos are processed securely and automatically deleted after translation.'
    },
    {
      icon: Clock,
      title: 'Auto Language Detection',
      description: 'Automatically detects source language or choose from 99+ supported languages.'
    }
  ]

  const steps = [
    { number: '01', title: 'Upload Video', desc: 'Drag & drop your video (MP4, MKV, MOV supported)' },
    { number: '02', title: 'Select Language', desc: 'Choose target Indian language for translation' },
    { number: '03', title: 'AI Processing', desc: 'Our AI extracts, translates & synthesizes speech' },
    { number: '04', title: 'Download', desc: 'Get your translated video with synced audio' }
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-purple/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-accent-purple/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm text-white/80">Powered by Sarvam AI</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white">AI Video Translator</span>
              <span className="block gradient-text mt-2">for Indian Languages</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform your videos with AI-powered translation. 
              Convert speech to Hindi, Kannada, Telugu, and Malayalam 
              with natural-sounding voice synthesis.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/translate" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                <Upload className="w-5 h-5" />
                Translate Video
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '4', label: 'Languages' },
              { value: '99%', label: 'Accuracy' },
              { value: '2x', label: 'Faster' },
              { value: '100K+', label: 'Videos' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our AI pipeline extracts audio, transcribes speech, translates text, 
              and synthesizes voice - all automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 relative group"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple 
                              flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm">{step.desc}</p>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-accent-purple to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Everything you need to translate videos to Indian languages with professional quality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 
                              flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 text-center relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-purple/10 to-accent-pink/10" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Translate Your Videos?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8">
                Start translating your content to Indian languages today. 
                No signup required - just upload and translate.
              </p>
              <Link to="/translate" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                <FileVideo className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
