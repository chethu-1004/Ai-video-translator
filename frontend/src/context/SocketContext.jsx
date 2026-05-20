import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id)
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const joinJob = (jobId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-job', jobId)
    }
  }

  const leaveJob = (jobId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-job', jobId)
    }
  }

  const onJobProgress = (jobId, callback) => {
    if (socketRef.current) {
      // Backend emits 'progress' event to room 'job-${jobId}'
      socketRef.current.on('progress', callback)
      return () => socketRef.current.off('progress', callback)
    }
    return () => {}
  }

  const value = {
    socket: socketRef.current,
    isConnected,
    joinJob,
    leaveJob,
    onJobProgress,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
