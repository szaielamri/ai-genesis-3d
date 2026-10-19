import type { EventKind, WorldState } from 'ai-genesis-shared'
import { nextId } from './ids.ts'

const EVENT_LIMIT = 40

export function pushEvent(world: WorldState, kind: EventKind, message: string): void {
  world.events.unshift({
    id: nextId('event'),
    tick: world.tick,
    year: world.year,
    kind,
    message,
  })
  if (world.events.length > EVENT_LIMIT) world.events.length = EVENT_LIMIT
}
