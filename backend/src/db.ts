import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { WorldState } from 'ai-genesis-shared'
import { isSimSpeed, rememberWorld } from './world.ts'

const dataDir = path.resolve(process.cwd(), 'data')
fs.mkdirSync(dataDir, { recursive: true })

const database = new DatabaseSync(path.join(dataDir, 'genesis.sqlite'))
database.exec('PRAGMA journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS snapshot (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    tick INTEGER NOT NULL,
    year REAL NOT NULL,
    kind TEXT NOT NULL,
    message TEXT NOT NULL
  );
`)

const readSnapshot = database.prepare('SELECT payload FROM snapshot WHERE id = 1')
const writeSnapshot = database.prepare(`
  INSERT INTO snapshot (id, payload) VALUES (1, ?)
  ON CONFLICT(id) DO UPDATE SET payload = excluded.payload
`)
const clearEvents = database.prepare('DELETE FROM events')
const insertEvent = database.prepare('INSERT INTO events (id, tick, year, kind, message) VALUES (?, ?, ?, ?, ?)')

export function loadWorld(): WorldState | null {
  const row = readSnapshot.get() as { payload: string } | undefined
  if (!row) return null
  try {
    const world = JSON.parse(row.payload) as WorldState
    if (!world || !Array.isArray(world.agents) || world.agents.length === 0) return null
    if (!isSimSpeed(world.speed)) world.speed = 1
    rememberWorld(world)
    return world
  } catch (error) {
    console.error('Ignoring unreadable simulation snapshot', error)
    return null
  }
}

export function saveWorld(world: WorldState): void {
  database.exec('BEGIN')
  try {
    writeSnapshot.run(JSON.stringify(world))
    clearEvents.run()
    for (const event of world.events) {
      insertEvent.run(event.id, event.tick, event.year, event.kind, event.message)
    }
    database.exec('COMMIT')
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

export function closeDatabase(): void {
  database.close()
}
