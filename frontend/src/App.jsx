import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import Translate from './pages/Translate'
import History from './pages/History'
import { SocketProvider } from './context/SocketContext'

function App() {
  return (
    <SocketProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </SocketProvider>
  )
}

export default App
