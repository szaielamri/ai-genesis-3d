import type { SimSpeed, WorldState } from 'ai-genesis-shared'
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

export function useSimulation() {
  const socketRef = useRef<Socket | null>(null)
  const [state, setState] = useState<WorldState | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('state', (next: WorldState) => setState(next))
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('state')
      socket.close()
    }
  }, [])

  const emit = (event: string, payload?: unknown) => {
    socketRef.current?.emit(event, payload)
  }

  return {
    state,
    connected,
    pause: () => emit('pause'),
    resume: () => emit('resume'),
    reset: () => emit('reset'),
    setSpeed: (speed: SimSpeed) => emit('setSpeed', speed),
  }
}
