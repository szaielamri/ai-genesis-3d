import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { createWorld } from './models/World.js'
import { step } from './simulation/tick.js'

const PORT = Number(process.env.PORT) || 3001
const TICK_MS = 100

const app = express()
app.use(cors())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

let world = createWorld()

setInterval(() => {
  if (!world.paused) {
    step(world)
  }
  io.emit('state', world)
}, TICK_MS)

io.on('connection', (socket) => {
  socket.emit('state', world)
  socket.on('pause', () => {
    world.paused = true
  })
  socket.on('resume', () => {
    world.paused = false
  })
  socket.on('reset', () => {
    world = createWorld()
    io.emit('state', world)
  })
})

httpServer.listen(PORT, () => {
  console.log(`AI Genesis simulation listening on http://localhost:${PORT}`)
})
