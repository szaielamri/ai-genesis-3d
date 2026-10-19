let sequence = 1

export function resetIds(): void {
  sequence = 1
}

export function nextId(prefix: string): string {
  const id = `${prefix}-${sequence}`
  sequence += 1
  return id
}

export function observeId(id: string): void {
  const match = /-(\d+)$/.exec(id)
  const raw = match?.[1]
  if (!raw) return
  const value = Number(raw)
  if (Number.isFinite(value) && value >= sequence) sequence = value + 1
}
