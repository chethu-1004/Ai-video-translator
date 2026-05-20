import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-surface/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 text-white/60">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-accent-pink fill-accent-pink" />
            <span>for Indian Languages by Chethan</span>
          </div>


          {/* Copyright */}
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} AI Video Translator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
