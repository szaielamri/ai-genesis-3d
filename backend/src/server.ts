import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import type { WorldState } from 'ai-genesis-shared'
import { closeDatabase, loadWorld, saveWorld } from './db.ts'
import { step } from './simulation/tick.ts'
import { createWorld, isSimSpeed } from './world.ts'

const port = Number(process.env.PORT ?? 3001)

class Simulation {
  world: WorldState
  private timer: NodeJS.Timeout | null = null

  constructor(world: WorldState) {
    this.world = world
  }

  bind(io: Server): void {
    this.schedule(io)
  }

  schedule(io: Server): void {
    if (this.timer) clearInterval(this.timer)
    const interval = Math.max(200, Math.round(1000 / this.world.speed))
    this.timer = setInterval(() => this.tick(io), interval)
  }

  tick(io: Server): void {
    if (!this.world.paused) {
      try {
        step(this.world)
        saveWorld(this.world)
      } catch (error) {
        console.error('Simulation tick failed', error)
      }
    }
    io.emit('state', this.world)
  }

  replace(io: Server, world: WorldState): void {
    this.world = world
    saveWorld(world)
    io.emit('state', world)
    this.schedule(io)
  }
}

const existing = loadWorld()
const simulation = new Simulation(existing ?? createWorld())
if (!existing) saveWorld(simulation.world)

const app = express()
app.use(cors())
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    tick: simulation.world.tick,
    population: simulation.world.agents.length,
    era: simulation.world.era,
  })
})
app.get('/api/state', (_req, res) => {
  res.json(simulation.world)
})

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.emit('state', simulation.world)
  socket.on('pause', () => {
    simulation.world.paused = true
    io.emit('state', simulation.world)
  })
  socket.on('resume', () => {
    simulation.world.paused = false
    io.emit('state', simulation.world)
  })
  socket.on('setSpeed', (speed: unknown) => {
    if (!isSimSpeed(speed)) return
    simulation.world.speed = speed
    simulation.schedule(io)
    io.emit('state', simulation.world)
  })
  socket.on('reset', () => {
    simulation.replace(io, createWorld())
  })
})

simulation.bind(io)

const server = httpServer.listen(port, () => {
  console.log(`AI Genesis listening on http://localhost:${port}`)
})

function shutdown(): void {
  server.close()
  closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
