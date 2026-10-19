import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSimulation(url) {
  const socketRef = useRef(null)
  const [state, setState] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(url, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('state', setState)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('state', setState)
      socket.disconnect()
    }
  }, [url])

  const emit = (event) => socketRef.current?.emit(event)

  return {
    state,
    connected,
    pause: () => emit('pause'),
    resume: () => emit('resume'),
    reset: () => emit('reset'),
  }
}
